import { Task } from "@/types/Task";
import { twMerge } from "@/utils/twMerge";

export default function TaskCard({
  task,
  onClick,
}: {
  task: Task;
  onClick: (task: Task) => void;
}) {
  return (
    <div
      className={twMerge(
        "bg-gray-100 text-white p-4",
        "rounded-md shadow-md cursor-pointer",
        "hover:bg-gray-600 transition-colors",
        "border-2",
        task.status === "DONE" &&
          "border-green-300 hover:border-green-400 bg-green-50 hover:bg-green-100",
        task.status === "IN_PROGRESS" &&
          "border-blue-300 hover:border-blue-400 bg-blue-50 hover:bg-blue-100",
        task.status === "TO_DO" &&
          "border-yellow-300 hover:border-yellow-400 bg-yellow-50 hover:bg-yellow-100"
      )}
      onClick={() => onClick(task)}
    >
      <h3 className="font-bold text-lg text-black">{task.title}</h3>
      {task.description && (
        <p className="text-sm text-gray-600 m-0">{task.description}</p>
      )}
      {/* soon user assigned, date, etc. */}
      <div className="flex justify-between text-xs flex-col gap-1">
        <span className="text-sm text-gray-500">
          Assigned to: {task.assignedToId ?? ""}
        </span>
        <span className="text-xs text-gray-500">
          Created:{" "}
          {new Date(task.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            minute: "2-digit",
            hour: "2-digit",
          })}
        </span>
        <span className="text-xs text-gray-500">
          Last update:{" "}
          {new Date(task.updatedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            minute: "2-digit",
            hour: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
}
