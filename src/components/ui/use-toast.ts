'use client';

import * as React from 'react';
import type { ToastProps } from '@/components/ui/toast';

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 4000;

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
};

type Action =
  | { type: 'ADD_TOAST'; toast: ToasterToast }
  | { type: 'DISMISS_TOAST'; toastId?: string }
  | { type: 'REMOVE_TOAST'; toastId?: string };

interface State {
  toasts: ToasterToast[];
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

function addToRemoveQueue(toastId: string, dispatch: React.Dispatch<Action>) {
  if (toastTimeouts.has(toastId)) return;
  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({ type: 'REMOVE_TOAST', toastId });
  }, TOAST_REMOVE_DELAY);
  toastTimeouts.set(toastId, timeout);
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };
    case 'DISMISS_TOAST': {
      return {
        ...state,
        toasts: state.toasts.map(t =>
          t.id === action.toastId || action.toastId === undefined
            ? { ...t, open: false }
            : t
        ),
      };
    }
    case 'REMOVE_TOAST':
      return {
        ...state,
        toasts: action.toastId === undefined
          ? []
          : state.toasts.filter(t => t.id !== action.toastId),
      };
  }
}

const listeners: Array<(state: State) => void> = [];
let memoryState: State = { toasts: [] };
let dispatch: React.Dispatch<Action> = () => {};

function globalDispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach(listener => listener(memoryState));
  if (action.type === 'DISMISS_TOAST') {
    const id = action.toastId;
    if (id) {
      addToRemoveQueue(id, globalDispatch);
    } else {
      memoryState.toasts.forEach(t => addToRemoveQueue(t.id, globalDispatch));
    }
  }
}

function genId() {
  return Math.random().toString(36).slice(2, 9);
}

type ToastInput = Omit<ToasterToast, 'id'>;

function toast(props: ToastInput) {
  const id = genId();
  globalDispatch({ type: 'ADD_TOAST', toast: { ...props, id, open: true } });
  // Auto dismiss
  setTimeout(() => globalDispatch({ type: 'DISMISS_TOAST', toastId: id }), TOAST_REMOVE_DELAY);
  return id;
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) listeners.splice(index, 1);
    };
  }, []);

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => globalDispatch({ type: 'DISMISS_TOAST', toastId }),
  };
}

export { useToast, toast };
export type { ToasterToast };
