'use client';

import { useState, useRef, useEffect } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onClear: () => void;
  placeholder?: string;
  initialValue?: string;
}

export function SearchBar({ 
  onSearch, 
  onClear, 
  placeholder = "Search schools, addresses, or suburbs...",
  initialValue = ""
}: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setShowSuggestions(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    onClear();
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.length >= 2) {
      // In a real app, you'd debounce this and make an API call for suggestions
      // For now, we'll just show mock suggestions
      setIsLoading(true);
      setTimeout(() => {
        setSuggestions([
          { type: 'school', name: 'Auckland Grammar School', subtitle: 'Secondary School' },
          { type: 'address', name: 'Queen Street, Auckland Central', subtitle: 'Address' },
          { type: 'suburb', name: 'Mission Bay', subtitle: 'Auckland' }
        ]);
        setShowSuggestions(true);
        setIsLoading(false);
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    setQuery(suggestion.name);
    onSearch(suggestion.name);
    setShowSuggestions(false);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder={placeholder}
            className="pl-10 pr-10"
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
        <Button type="submit" disabled={!query.trim()}>
          Search
        </Button>
      </form>

      {/* Suggestions dropdown */}
      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              Searching...
            </div>
          ) : suggestions.length > 0 ? (
            <div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {suggestion.type === 'school' && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      )}
                      {suggestion.type === 'address' && (
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                      )}
                      {suggestion.type === 'suburb' && (
                        <div className="w-2 h-2 bg-purple-500 rounded-full" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {suggestion.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {suggestion.subtitle}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              No suggestions found
            </div>
          )}
        </div>
      )}
    </div>
  );
}