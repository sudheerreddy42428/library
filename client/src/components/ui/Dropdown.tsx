import React, { Fragment, ReactNode } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { MoreHorizontal } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface DropdownItemProps {
  label: string;
  icon?: React.ElementType;
  onClick: () => void;
  danger?: boolean;
}

interface DropdownProps {
  items: DropdownItemProps[];
  trigger?: ReactNode;
}

export function Dropdown({ items, trigger }: DropdownProps) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button as={Fragment}>
          {trigger ? trigger : (
            <button className="flex items-center justify-center w-8 h-8 rounded-md text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors focus:outline-none">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          )}
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-1 w-48 origin-top-right divide-y divide-[var(--border)] rounded-md bg-[var(--card)] shadow-lg ring-1 ring-black/5 focus:outline-none z-50">
          <div className="px-1 py-1">
            {items.map((item, index) => (
              <Menu.Item key={index}>
                {({ active }) => (
                  <button
                    onClick={item.onClick}
                    className={cn(
                      "group flex w-full items-center rounded-md px-2 py-2 text-sm transition-colors",
                      active && !item.danger ? "bg-[var(--muted)] text-[var(--foreground)]" : "",
                      active && item.danger ? "bg-[var(--color-danger-50)] text-[var(--color-danger-600)] dark:bg-[var(--color-danger-900)]/30" : "",
                      !active && item.danger ? "text-[var(--color-danger-500)]" : "",
                      !active && !item.danger ? "text-[var(--foreground)]" : ""
                    )}
                  >
                    {item.icon && (
                      <item.icon
                        className={cn("mr-2 h-4 w-4", item.danger ? "text-[var(--color-danger-500)]" : "text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]")}
                        aria-hidden="true"
                      />
                    )}
                    {item.label}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
