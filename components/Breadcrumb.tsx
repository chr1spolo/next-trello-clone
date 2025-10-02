"use client";

import { twMerge } from "@/utils/twMerge";
import React from "react";

interface BreadcrumbProps {
  children?: React.ReactNode;
}

const Breadcrumb = ({ children }: BreadcrumbProps) => {
  const allChildren = React.Children.toArray(children);
  const lastIndex = allChildren.length - 1;
  return (
    <nav className="text-sm breadcrumbs">
      <ul className="flex items-center gap-1">
        {allChildren.map((child, index) => {
          return (
            <li
              key={index}
              className={twMerge(
                "text-gray-500 text-xs",
                index === lastIndex ? "font-bold" : ""
              )}
            >
              {child}
              {index !== lastIndex && (
                <span className="text-gray-400 ml-1" key={"sep-" + index}>
                  /
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Breadcrumb;
