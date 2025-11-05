import Link from "next/link";
import Image from "next/image";
import { Mentor } from "@/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin } from "lucide-react";

interface MentorCardProps {
  mentor: Mentor;
}

export function MentorCard({ mentor }: MentorCardProps) {
  const { profile } = mentor;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        {/* Header with Avatar */}
        <div className="flex items-start space-x-4 mb-4">
          {mentor.photoUrl ? (
            <div className="relative h-16 w-16 rounded-full overflow-hidden bg-muted">
              <Image
                src={mentor.photoUrl}
                alt={mentor.name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-2xl font-bold">
              {mentor.name.charAt(0)}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{mentor.name}</h3>
            <div className="flex items-center mt-1 text-sm text-muted-foreground">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
              <span className="font-medium">{profile.averageRating}</span>
              <span className="mx-1">•</span>
              <span>{profile.totalReviews} reviews</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {mentor.description}
        </p>

        {/* Skills */}
        <div className="flex flex-wrap gap-2 mb-4">
          {profile.specialties.slice(0, 3).map((skill) => (
            <Badge key={skill} variant="secondary">
              {skill}
            </Badge>
          ))}
          {profile.specialties.length > 3 && (
            <Badge variant="outline">+{profile.specialties.length - 3}</Badge>
          )}
        </div>

        {/* Experience & Price */}
        <div className="flex items-center justify-between text-sm">
          {profile.yearsOfExperience && (
            <span className="text-muted-foreground">
              {profile.yearsOfExperience} años exp.
            </span>
          )}
          <span className="font-bold text-lg text-primary">
            ${profile.hourlyRate}/hr
          </span>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <Link href={`/mentors/${mentor.id}`} className="w-full">
          <Button className="w-full">Ver Perfil</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
