'use client'

import React, {FormEvent, useState} from "react";
import {allCards, CardItem, cardsInfo} from "@/app/cr-api";

export default function Home() {
    const [stack, setStack] = useState<CardItem[]>([]);
    const [searchInput, setSearchInput] = useState<string>("")

    const handleCardSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (searchInput.trim() === "") return;
        const newCard: CardItem = cardsInfo[searchInput]
        setStack((prevStack) => [...prevStack, newCard]);
        setSearchInput("")
    };

    const handleHoldingCardClick = (index: number) => {
        setStack((oldStack) => {
            const newStack = [...oldStack];
            const [clickedCard] = newStack.splice(index, 1)
            const [replaceCard] = newStack.splice(-4, 1)
            newStack.splice(index, 0, replaceCard)
            newStack.push(clickedCard);
            return newStack
        });
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen space-y-8">
            {/* Search Bar with Submit */}
            <form onSubmit={handleCardSubmit} className="flex flex-col items-center">
                <input
                    type="text"
                    list="cards"
                    placeholder="Select a card..."
                    value={searchInput}
                    onChange={(e) => {
                        setSearchInput(e.target.value);
                    }}
                    className="p-2 border border-gray-400 rounded-md mb-2"
                />
                <datalist id="cards">
                    {allCards.map((card, index) => (
                        <option value={card} key={index}/>
                    ))}
                </datalist>
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md">
                    Add Card
                </button>
            </form>

            {/* Holding Cards */}
            <div className="flex flex-row space-x-4 border-2 border-gray-200">
                {stack.slice(0, -4).map((card, index) => (
                    <div
                        key={index}
                        className="w-24 h-48 flex flex-col items-center justify-center cursor-pointer"
                        onClick={handleHoldingCardClick.bind(null, index)}
                    >
                        <img src={card.iconUrls.medium} alt={card.name} className="mt-2"/>
                    </div>
                ))}
            </div>

            {/* Upcoming Cards */}
            <div className="flex flex-row space-x-4 mt-4">
                {stack.slice(-4).map((card, index) => (
                    <div key={index} className="w-24 h-48 flex flex-col items-center justify-center">
                        <img src={card.iconUrls.medium} alt={card.name} className="mt-2"/>
                        <div className="mt-2">{stack.length <= 4
                            ? index + (5 - stack.length)
                            : index + 1}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
