'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useRouteStore } from '@/store/useRouteStore';
import { DragHandle, Trash2 } from 'lucide-react';
import { type Stop } from '@/lib/types';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

function SortableTableRow({ stop, index }: { stop: Stop; index: number }) {
  const {
    attributes,
    listeners,
    transform,
    transition,
    setNodeRef,
  } = useSortable({ id: stop.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell className="w-10">
        <Button
          variant="ghost"
          size="icon"
          className="cursor-grab"
          {...attributes}
          {...listeners}
        >
          <DragHandle size={16} />
        </Button>
      </TableCell>
      <TableCell className="w-10 text-center">{index + 1}</TableCell>
      <TableCell className="font-medium">{stop.label}</TableCell>
      <TableCell className="max-w-xs truncate">{stop.address}</TableCell>
      <TableCell className="whitespace-nowrap">
        {stop.windowStart && `${stop.windowStart} - ${stop.windowEnd || ''}`}
      </TableCell>
      <TableCell className="w-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => useRouteStore.getState().removeStop(stop.id)}
        >
          <Trash2 size={16} />
        </Button>
      </TableCell>
    </TableRow>
  );
}

export default function StopsTable() {
  const { stops, reorderStops } = useRouteStore();
  const [isMounted, setIsMounted] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = stops.findIndex((stop) => stop.id === active.id);
      const newIndex = stops.findIndex((stop) => stop.id === over.id);
      reorderStops(oldIndex, newIndex);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis]}
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10"></TableHead>
            <TableHead className="w-10">Nº</TableHead>
            <TableHead>Apelido</TableHead>
            <TableHead>Endereço</TableHead>
            <TableHead>Janela</TableHead>
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <SortableContext
            items={stops.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {stops.map((stop, index) => (
              <SortableTableRow
                key={stop.id}
                stop={stop}
                index={index}
              />
            ))}
          </SortableContext>
        </TableBody>
      </Table>
    </DndContext>
  );
}