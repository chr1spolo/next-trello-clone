interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
}

export default function TaskCard({ task }: { task: Task }) {
  return (
    <div className="bg-white p-4 rounded-md shadow-md">
      <h3 className="font-bold text-lg text-black">{task.title}</h3>
      {task.description && (
        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
      )}
      {/* soon user assigned, date, etc. */}
    </div>
  );
}
