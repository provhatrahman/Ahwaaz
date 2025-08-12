import React, { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ChevronDown, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../theme/ThemeProvider";

export default function SearchableFilterGroup({ title, options, selected, onSelectionChange, disabledOptions = [] }) {
  const { isDarkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className={`w-full flex justify-between items-center px-2 py-2 text-sm font-semibold ${isDarkMode ? 'text-gray-200 hover:text-gray-100 hover:bg-gray-800/50' : 'text-gray-900 hover:bg-gray-100'}`}
        >
          {title}
          <ChevronDown
            className={`h-5 w-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
          />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent asChild>
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              key="content"
              initial="collapsed"
              animate="open"
              exit="collapsed"
              variants={{
                open: { opacity: 1, height: "auto" },
                collapsed: { opacity: 0, height: 0 },
              }}
              transition={{ duration: 0.2, ease: [0.04, 0.62, 0.23, 0.98] }}
              className="overflow-hidden"
            >
              <div className="space-y-3 px-2 pb-4 pt-3">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                  <Input
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`pl-9 h-9 ${isDarkMode ? 'bg-gray-800/50 border-gray-600/50 text-gray-200 placeholder:text-gray-500' : 'bg-white border-gray-200'}`}
                  />
                </div>
                <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                  {filteredOptions.length > 0 ? (
                    filteredOptions.map((option) => {
                      const isDisabled = disabledOptions.includes(option);
                      return (
                        <div key={option} className={`flex items-center space-x-3 ${isDisabled ? 'opacity-50' : ''}`}>
                          <Checkbox
                            id={`${title}-${option}`}
                            checked={selected.includes(option)}
                            onCheckedChange={() => onSelectionChange(option)}
                            disabled={isDisabled}
                            className={isDarkMode ? 'border-gray-500 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600' : ''}
                          />
                          <Label
                            htmlFor={`${title}-${option}`}
                            className={`text-sm font-normal flex-1 ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'} ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                          >
                            {option}
                          </Label>
                        </div>
                      )
                    })
                  ) : (
                    <p className={`text-sm text-center py-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>No results found.</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CollapsibleContent>
    </Collapsible>
  );
}