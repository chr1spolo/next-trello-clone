import { Task } from "@/types/Task";
import { twMerge } from "@/utils/twMerge";

export default function TaskCard({
  task,
  onClick,
}: {
  task: Task;
  onClick: (task: Task) => void;
}) {
  console.log(task);
  return (
    <div
      className={twMerge(
        "bg-white p-4 rounded shadow mb-4",
        "hover:bg-gray-50 cursor-pointer",
        "border border-transparent hover:border-gray-200",
        "transition-all duration-150 ease-in-out",
        task.status === "DONE" && "border-green-300 hover:border-green-400 ",
        task.status === "IN_PROGRESS" &&
          "border-blue-300 hover:border-blue-400 ",
        task.status === "TO_DO" && "border-yellow-300 hover:border-yellow-400 "
      )}
      onClick={() => onClick(task)}
    >
      <h3 className="font-bold text-lg text-black">{task.title}</h3>
      {task.description && (
        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
      )}
      {/* soon user assigned, date, etc. */}
      <div className="mt-2 flex justify-between text-xs flex-col gap-1">
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
