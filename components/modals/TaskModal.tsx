"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Task } from "@/types/Task";
import { Comment } from "@/types/Comment";
import { twMerge } from "@/utils/twMerge";

interface TaskModalProps {
  task: Task | null;
  onClose: () => void;
  onUpdate: (updatedTask: Task) => void;
  onAddComment: (newComment: Comment) => void;
}

export default function TaskModal({
  task,
  onClose,
  onUpdate,
  onAddComment,
}: TaskModalProps) {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task?.title || "");
  const [editedDescription, setEditedDescription] = useState(
    task?.description || ""
  );
  const [newComment, setNewComment] = useState("");

  const handleUpdate = async () => {
    const res = await fetch(`/api/tasks/${task?.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editedTitle,
        description: editedDescription,
      }),
    });
    if (res.ok) {
      const updatedTask = await res.json();
      onUpdate(updatedTask);
      setIsEditing(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const res = await fetch(`/api/tasks/${task?.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newComment }),
    });
    if (res.ok) {
      const addedComment = await res.json();
      onAddComment({
        ...addedComment,
        author: {
          name: session?.user?.name || "",
          image: session?.user?.image || "",
        },
      });
      setNewComment("");
    }
  };

  return (
    <div
      className={twMerge(
        "fixed inset-0 bg-black/50",
        "flex items-center justify-center p-4 z-50",
        "transition-all duration-300 ease-in-out",
        task ? "opacity-100" : "opacity-0 pointer-events-none -z-10"
      )}
      onClick={() => task && onClose()}
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-lg font-bold cursor-pointer"
        >
          &times;
        </button>
        <div className="flex flex-col space-y-4">
          {isEditing ? (
            <>
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="text-2xl font-bold border-b focus:outline-none text-black border-gray-300 mt-5"
              />
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                placeholder="Añadir una descripción..."
                className="w-full h-24 border rounded-md p-2 focus:outline-none text-black border-gray-300 resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleUpdate}
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Guardar
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-red-500 rounded text-white"
                >
                  Cancelar
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-black">{task?.title}</h2>
              <p className="text-gray-500">
                {editedDescription || "Sin descripción"}
              </p>
              <button
                onClick={() => setIsEditing(true)}
                className="text-blue-600 hover:underline text-left"
              >
                Editar
              </button>
            </>
          )}

          <div className="border-t pt-4 mt-4">
            <h3 className="text-xl font-semibold mb-2 text-black">
              Comentarios
            </h3>
            <div className="space-y-4 max-h-[200px] overflow-y-auto">
              {task?.comments?.map((comment) => (
                <div key={comment.id} className="flex items-start space-x-2">
                  {comment.author.image && (
                    <Image
                      src={comment.author.image}
                      alt="Avatar"
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                  )}
                  <div className="bg-gray-100 p-2 rounded-lg flex-grow">
                    <div className="font-semibold text-black">
                      {comment.author.name}
                    </div>
                    <p className="text-gray-600 italic">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleAddComment} className="mt-4 flex space-x-2">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escribe un comentario..."
                className="flex-grow border rounded-md p-2 border-gray-300 text-black outline-none min-h-16"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded max-h-10"
              >
                Enviar
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
