'use client'

import React, { useState } from "react";
import { allCards, CardItem, cardsInfo } from "@/app/cr-api";

export default function Home() {
    const [stack, setStack] = useState<CardItem[]>([]);
    const [filterText, setFilterText] = useState<string>("");
    const [availableCards, setAvailableCards] = useState<string[]>(allCards);
    const [championAlive, setChampionAlive] = useState<boolean>(false);
    const [currentChampion, setCurrentChampion] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<string>("elixir");
    const [ascending, setAscending] = useState<boolean>(true);

    const rarityOrder = ["common", "rare", "epic", "legendary", "champion"];

    const handleCardSelect = (cardName: string) => {
        if (cardName.trim() === "") return;
        const newCard: CardItem = cardsInfo[cardName];
        if (newCard.rarity === "champion") {
            setChampionAlive(true);
            setCurrentChampion(cardName);
        } else {
            setStack((prevStack) => [...prevStack, newCard]);
        }

        setAvailableCards((prevAvailableCards) => {
            let updatedCards = prevAvailableCards.filter((name) => name !== cardName);

            // Handle evolved counterparts
            if (cardName.startsWith("Evolved ")) {
                const normalCardName = cardName.replace("Evolved ", "");
                updatedCards = updatedCards.filter((name) => name !== normalCardName);
            } else {
                const evolvedCardName = `Evolved ${cardName}`;
                updatedCards = updatedCards.filter((name) => name !== evolvedCardName);
            }

            // If two evolved cards are picked, remove all other evolved cards
            const evolvedCardsInStack = stack.filter(card => card.name.startsWith("Evolved ")).length;
            if (evolvedCardsInStack + (cardName.startsWith("Evolved ") ? 1 : 0) >= 2) {
                updatedCards = updatedCards.filter((name) => !name.startsWith("Evolved "));
            }

            // If a champion is picked, remove all other champions and set champion alive state
            if (newCard.rarity === "champion") {
                updatedCards = updatedCards.filter((name) => cardsInfo[name].rarity !== "champion");
            }

            return updatedCards;
        });
        setFilterText("");
    };

    const handleChampionDeath = () => {
        setChampionAlive(false);
        if (currentChampion != null) {
            setStack((oldStack) => {
                const newStack = [...oldStack];
                const [replaceCard] = newStack.splice(-2, 1);
                newStack.push(cardsInfo[currentChampion], replaceCard);
                return newStack;
            });
        }
    };

    const handleHoldingCardClick = (index: number) => {
        setStack((oldStack) => {
            const newStack = [...oldStack];
            const [clickedCard] = newStack.splice(index, 1);
            const [replaceCard] = newStack.splice((championAlive ? -3 : -4), 1);
            newStack.splice(index, 0, replaceCard);
            if (clickedCard.rarity === "champion") {
                setChampionAlive(true);
            } else {
                newStack.push(clickedCard);
            }
            return newStack;
        });
    };

    const handleResetStack = () => {
        setStack([]);
        setAvailableCards(allCards);
        setChampionAlive(false);
        setCurrentChampion(null);
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSortBy(e.target.value);
    };

    const handleToggleAscending = () => {
        setAscending((prevAscending) => !prevAscending);
    };

    const filteredCards = availableCards
        .filter((cardName) => cardName.toLowerCase().includes(filterText.toLowerCase()))
        .sort((a, b) => {
            const cardA = cardsInfo[a];
            const cardB = cardsInfo[b];
            let comparison = 0;
            switch (sortBy) {
                case "elixir":
                    comparison = cardA.elixirCost - cardB.elixirCost;
                    break;
                case "rarity":
                    comparison = rarityOrder.indexOf(cardA.rarity) - rarityOrder.indexOf(cardB.rarity);
                    break;
                case "name":
                default:
                    comparison = cardA.name.localeCompare(cardB.name);
                    break;
            }
            return ascending ? comparison : -comparison;
        });

    const incompleteDeck: boolean = stack.length + +(currentChampion != null) < 8;

    return (
        <div className="flex flex-row items-start justify-center h-screen space-x-8 p-4 relative bg-gradient-to-b from-blue-800 via-purple-950 to-red-950 animate-gradient-y">
            <style jsx>{`
                .animate-gradient-y {
                    background-size: 200% 200%;
                    animation: gradientAnimation 10s ease infinite;
                }
                @keyframes gradientAnimation {
                    0% { background-position: 50% 0%; }
                    50% { background-position: 50% 100%; }
                    100% { background-position: 50% 0%; }
                }
            `}</style>

            {/* Reset Button */}
            <button
                onClick={handleResetStack}
                className="absolute top-4 right-4 px-4 py-2 bg-red-500 text-white rounded-md"
            >
                {"Reset Deck"}
            </button>

            {/* Champion Death Button */}
            {championAlive && (
                <button
                    onClick={handleChampionDeath}
                    className="absolute top-16 right-4 px-4 py-2 bg-yellow-500 text-black rounded-md"
                >
                    {"Champion Defeated"}
                </button>
            )}

            {/* Card Selection Section */}
            <div className="flex-grow overflow-y-auto border-2 border-gray-200 p-4 w-1/2 flex-1 h-full bg-gray-900 bg-opacity-70">
                {incompleteDeck && (
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Search cards..."
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                            className="p-2 border border-gray-400 rounded-md w-full mb-4 text-black"
                        />
                        <div className="flex items-center space-x-4 mb-4">
                            <select value={sortBy} onChange={handleSortChange} className="p-2 border border-gray-400 rounded-md text-black">
                                <option value="name">Name</option>
                                <option value="elixir">Elixir Cost</option>
                                <option value="rarity">Rarity</option>
                            </select>
                            <button
                                onClick={handleToggleAscending}
                                className="px-4 py-2 bg-blue-500 text-white rounded-md"
                            >
                                {ascending ? "Ascending" : "Descending"}
                            </button>
                        </div>
                    </div>
                )}
                {incompleteDeck && (
                    <div className="grid grid-cols-6 gap-6">
                        {filteredCards.map((cardName, index) => {
                            const card = cardsInfo[cardName];
                            return (
                                <div
                                    key={index}
                                    className="w-20 flex flex-col items-center cursor-pointer"
                                    onClick={() => handleCardSelect(cardName)}
                                >
                                    <img
                                        src={card.iconUrls.medium}
                                        alt={card.name}
                                        className="w-full h-auto"
                                    />
                                    {/*<div className="text-center mt-2">{card.name}</div>*/}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Deck Section */}
            <div className="flex flex-col items-center space-y-8 w-1/2 h-full">
                {/* Holding Cards */}
                <div className="flex flex-row space-x-4 border-2 border-gray-200 p-2">
                    {stack.slice(0, (championAlive ? -3 : -4)).map((card, index) => (
                        <div
                            key={index}
                            className="w-24 h-48 flex flex-col items-center justify-center cursor-pointer"
                            onClick={handleHoldingCardClick.bind(null, index)}
                        >
                            <img src={card.iconUrls.medium} alt={card.name} className="mt-2" />
                        </div>
                    ))}
                </div>

                {/* Upcoming Cards */}
                <div className="flex flex-row space-x-4 p-2">
                    {stack.slice((championAlive ? -3 : -4)).map((card, index) => {
                        const upIn =
                            stack.length <= 4 ? index + (5 - stack.length) : index + 1;
                        return (
                            <div key={index} className="w-24 h-48 flex flex-col items-center justify-center">
                                <img src={card.iconUrls.medium} alt={card.name} className="mt-2" />
                                <div className="mt-2">{upIn == 1 ? "NEXT" : upIn}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
