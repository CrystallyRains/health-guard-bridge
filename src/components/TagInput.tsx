import { X, Plus } from "lucide-react";
import { useState } from "react";

interface Props {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  variant?: "allergy" | "medication" | "condition";
}

const variantClass: Record<string, string> = {
  allergy: "tag-allergy",
  medication: "tag-medication",
  condition: "tag-condition",
};

export default function TagInput({ tags, onChange, placeholder = "Add item...", variant = "condition" }: Props) {
  const [input, setInput] = useState("");

  const addTag = () => {
    const val = input.trim();
    if (val && !tags.includes(val)) {
      onChange([...tags, val]);
      setInput("");
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag) => (
          <span key={tag} className={`${variantClass[variant]} flex items-center gap-1`}>
            {tag}
            <button type="button" onClick={() => onChange(tags.filter((t) => t !== tag))}>
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="input-field flex-1 text-sm"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
        />
        <button type="button" onClick={addTag} className="btn-secondary py-2 px-3">
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
