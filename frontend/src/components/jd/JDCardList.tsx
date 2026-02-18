"use client";

import { useJDStore } from "@/stores/jdStore";
import { JDCard } from "./JDCard";
import { JDAddButton } from "./JDAddButton";

export function JDCardList() {
  const cards = useJDStore((s) => s.cards);

  return (
    <div className="flex flex-col gap-4">
      {cards.map((card, index) => (
        <JDCard key={card.id} card={card} index={index} />
      ))}
      <JDAddButton />
    </div>
  );
}
