"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

/**
 * MYM-15: Clear Search Button
 * Client component that clears the keyword search param and navigates
 */
export function ClearSearchButton() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleClear = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("keyword");
    params.delete("page");
    params.delete("cursor");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <Button
      data-testid="clear_search_button"
      variant="outline"
      size="sm"
      onClick={handleClear}
    >
      Limpiar búsqueda
    </Button>
  );
}
