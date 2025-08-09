import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, InputProps } from "@/components/ui/input";
import { X } from "lucide-react";
import { Dispatch, SetStateAction, forwardRef, useState, useEffect, useRef } from "react";

type InputTagsProps = InputProps & {
  value: string[];
  onChange: Dispatch<SetStateAction<string[]>>;
  suggestions?: string[] | (() => Promise<string[]>);
};

export const InputTags = forwardRef<HTMLInputElement, InputTagsProps>(
  ({ value, onChange, suggestions, ...props }, ref) => {
    const [pendingDataPoint, setPendingDataPoint] = useState("");
    const [availableSuggestions, setAvailableSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
    const suggestionsRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      const loadSuggestions = async () => {
        if (suggestions) {
          if (typeof suggestions === 'function') {
            try {
              const loadedSuggestions = await suggestions();
              setAvailableSuggestions(loadedSuggestions);
            } catch (error) {
              console.error('Error loading tag suggestions:', error);
              setAvailableSuggestions([]);
            }
          } else {
            setAvailableSuggestions(suggestions);
          }
        }
      };

      loadSuggestions();
    }, [suggestions]);

    useEffect(() => {
      if (!pendingDataPoint.trim()) {
        setFilteredSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      const filtered = availableSuggestions
        .filter(suggestion => 
          suggestion.toLowerCase().includes(pendingDataPoint.toLowerCase()) &&
          !value.includes(suggestion)
        )
        .slice(0, 10);

      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    }, [pendingDataPoint, availableSuggestions, value]);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          suggestionsRef.current &&
          !suggestionsRef.current.contains(event.target as Node) &&
          inputRef.current &&
          !inputRef.current.contains(event.target as Node)
        ) {
          setShowSuggestions(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    const addPendingDataPoint = () => {
      if (pendingDataPoint && pendingDataPoint.trim()) {
        const trimmedTag = pendingDataPoint.trim();
        if (!value.includes(trimmedTag)) {
          onChange([...value, trimmedTag]);
        }
        setPendingDataPoint("");
        setShowSuggestions(false);
      }
    };

    const selectSuggestion = (suggestion: string) => {
      if (!value.includes(suggestion)) {
        onChange([...value, suggestion]);
      }
      setPendingDataPoint("");
      setShowSuggestions(false);
    };

    const removeTag = (indexToRemove: number) => {
      onChange(value.filter((_, index) => index !== indexToRemove));
    };

    return (
      <div className="space-y-2">
        <div className="relative">
          <div className="flex">
            <Input
              ref={(node) => {
                inputRef.current = node;
                if (typeof ref === 'function') {
                  ref(node);
                } else if (ref) {
                  ref.current = node;
                }
              }}
              value={pendingDataPoint}
              onChange={(e) => setPendingDataPoint(e.target.value)}
              onFocus={() => {
                if (filteredSuggestions.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addPendingDataPoint();
                } else if (e.key === "," || e.key === " ") {
                  e.preventDefault();
                  addPendingDataPoint();
                }
              }}
              className="rounded-r-none"
              {...props}
            />
            <Button
              type="button"
              variant="secondary"
              className="rounded-l-none border border-l-0"
              onClick={addPendingDataPoint}
            >
              Add
            </Button>
          </div>
          
          {/* Suggestions Dropdown */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto"
            >
              {filteredSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                  onClick={() => selectSuggestion(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="border rounded-md min-h-[2.5rem] overflow-y-auto p-2 flex gap-2 flex-wrap items-center">
          {value.map((item, idx) => (
            <Badge key={idx} variant="secondary" className="flex items-center gap-1">
              {item}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => removeTag(idx)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          {value.length === 0 && (
            <span className="text-muted-foreground text-sm">No tags added yet</span>
          )}
        </div>
      </div>
    );
  }
);