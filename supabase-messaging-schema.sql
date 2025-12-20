-- SQL para crear tablas de messaging system
-- Ejecutar en SQL Editor de Supabase Dashboard

-- 1. Tabla de Conversaciones
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1_id UUID REFERENCES profiles(id) NOT NULL,
  participant_2_id UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraint para evitar duplicados
  UNIQUE(participant_1_id, participant_2_id)
);

-- 2. Tabla de Mensajes
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES profiles(id) NOT NULL,
  content TEXT NOT NULL CHECK (length(content) >= 10), -- Mínimo 10 caracteres
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Índices para performance
CREATE INDEX idx_conversations_participant_1 ON conversations(participant_1_id);
CREATE INDEX idx_conversations_participant_2 ON conversations(participant_2_id);
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- 4. Row Level Security (RLS)
-- Habilitar RLS en las tablas
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 5. Políticas RLS para Conversaciones
-- Usuarios solo pueden ver conversaciones donde son participantes
CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT USING (
    auth.uid() = participant_1_id OR auth.uid() = participant_2_id
  );

-- Usuarios solo pueden insertar conversaciones donde son participant_1
CREATE POLICY "Users can start conversations" ON conversations
  FOR INSERT WITH CHECK (
    auth.uid() = participant_1_id
  );

-- Usuarios solo pueden actualizar conversaciones donde son participantes
CREATE POLICY "Users can update own conversations" ON conversations
  FOR UPDATE USING (
    auth.uid() = participant_1_id OR auth.uid() = participant_2_id
  );

-- 6. Políticas RLS para Mensajes
-- Usuarios solo pueden ver mensajes en sus conversaciones
CREATE POLICY "Users can view messages in own conversations" ON messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT id FROM conversations
      WHERE participant_1_id = auth.uid() OR participant_2_id = auth.uid()
    )
  );

-- Usuarios solo pueden insertar mensajes en sus conversaciones
CREATE POLICY "Users can send messages in own conversations" ON messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    conversation_id IN (
      SELECT id FROM conversations
      WHERE participant_1_id = auth.uid() OR participant_2_id = auth.uid()
    )
  );

-- Usuarios solo pueden leer/actualizar sus propios mensajes
CREATE POLICY "Users can update own messages" ON messages
  FOR UPDATE USING (
    sender_id = auth.uid()
  );

-- 7. Función para actualizar timestamp de conversación
CREATE OR REPLACE FUNCTION update_conversation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations 
  SET updated_at = NOW() 
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Trigger para actualizar conversación cuando se envía mensaje
CREATE TRIGGER update_conversation_timestamp
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_updated_at();

-- 9. Función para marcar mensajes como leídos (opcional)
CREATE OR REPLACE FUNCTION mark_messages_as_read(p_conversation_id UUID, p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE messages 
  SET is_read = TRUE 
  WHERE conversation_id = p_conversation_id 
  AND sender_id != p_user_id 
  AND is_read = FALSE;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;