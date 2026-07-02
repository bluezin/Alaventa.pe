import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import {
  useGetListingComments,
  useCreateComment,
  useDeleteComment,
  type Comment,
} from "@workspace/api-client-react";
import { MessageCircle, Trash2, Send, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { getInitials } from "../lib/utils";

interface CommentsSectionProps {
  listingId: number;
}

export default function CommentsSection({ listingId }: CommentsSectionProps) {
  const { userId } = useAuth();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [newComment, setNewComment] = useState("");

  const { data, isLoading } = useGetListingComments(listingId, { page, limit: 10 });
  const createMutation = useCreateComment({
    mutation: {
      onSuccess: () => {
        setNewComment("");
        setPage(1);
        qc.invalidateQueries({ queryKey: [`/api/listings/${listingId}/comments`] });
      },
    },
  });
  const deleteMutation = useDeleteComment({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: [`/api/listings/${listingId}/comments`] });
      },
    },
  });

  const comments = data?.comments ?? [];
  const total = data?.total ?? 0;
  const hasMore = data?.hasMore ?? false;
  const totalPages = Math.ceil(total / 10);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim()) return;
    createMutation.mutate({ id: listingId, data: { content: newComment.trim() } });
  }

  async function handleDelete(commentId: number) {
    if (!confirm("¿Eliminar este comentario?")) return;
    deleteMutation.mutate({ id: listingId, commentId });
  }

  function timeAgo(dateStr: string) {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: es });
    } catch {
      return "";
    }
  }

  return (
    <div className="bg-card rounded-2xl border border-card-border p-5 shadow-sm">
      <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
        <MessageCircle className="w-5 h-5" />
        Comentarios ({total})
      </h2>

      {/* New comment form */}
      {userId ? (
        <form onSubmit={handleSubmit} className="mb-5">
          <div className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Escribe un comentario..."
              className="flex-1 bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
              maxLength={500}
            />
            <button
              type="submit"
              disabled={!newComment.trim() || createMutation.isPending}
              className="shrink-0 bg-primary text-white rounded-xl px-4 py-2.5 text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer"
            >
              {createMutation.isPending ? (
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </span>
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </form>
      ) : (
        <p className="text-sm text-muted-foreground mb-5">
          Inicia sesión para dejar un comentario.
        </p>
      )}

      {/* Comments list */}
      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-muted shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 bg-muted rounded" />
                <div className="h-3 w-full bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          No hay comentarios aún. Sé el primero en comentar.
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment: Comment) => (
            <div key={comment.id} className="flex gap-3">
              {/* Avatar */}
              {comment.userAvatarUrl ? (
                <img
                  src={comment.userAvatarUrl}
                  alt={comment.userName}
                  className="w-9 h-9 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                  {getInitials(comment.userName)}
                </div>
              )}
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-semibold text-foreground">
                    {comment.userName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {timeAgo(comment.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-foreground/75 whitespace-pre-line break-words">
                  {comment.content}
                </p>
                {/* Delete button */}
                {userId === comment.userId && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="mt-1 text-xs text-muted-foreground hover:text-red-500 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-5 pt-4 border-t border-card-border">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => (hasMore ? p + 1 : p))}
            disabled={!hasMore}
            className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
