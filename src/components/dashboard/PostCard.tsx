import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Eye } from "lucide-react";

interface Post {
  id: number;
  title: string;
  description: string;
  images?: string[];
  created_at: string;
  post_type: string;
}

export const PostCard: React.FC<{ post: Post }> = ({ post }) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-semibold text-lg">{post.title}</h3>
          <Badge variant="outline">{post.post_type}</Badge>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-3">
          {post.description}
        </p>

        <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>ID: {post.id}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{new Date(post.created_at).toLocaleDateString()}</span>
          </div>
          {post.images && post.images.length > 0 && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{post.images.length} imagen(es)</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
