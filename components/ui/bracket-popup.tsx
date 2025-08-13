"use client";

import { useState } from "react";
import type React from 'react';
import { X, Trophy, Clock, CheckCircle, AlertCircle } from "lucide-react";

interface BracketMatch {
  bracket_id: string;
  round_number: number;
  match_number: number;
  player1_id?: string;
  player2_id?: string;
  winner_id?: string;
  player1_score: number;
  player2_score: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  scheduled_time?: string;
  completed_time?: string;
  player1?: { name: string; user_id: string };
  player2?: { name: string; user_id: string };
  winner?: { name: string; user_id: string };
}

interface TournamentResult {
  result_id: string;
  placement: number;
  prize_amount?: string;
  user: { name: string; user_id: string };
  prize_currency?: { symbol: string };
}

interface Tournament {
  tournament_id: string;
  name: string;
  description?: string;
  format: string;
  status: string;
  max_participants: number;
  start_date: string;
  end_date: string;
}

interface BracketPopupProps {
  isOpen: boolean;
  onClose: () => void;
  tournament: Tournament;
  matches: BracketMatch[];
  results: TournamentResult[];
}

export default function BracketPopup({ isOpen, onClose, tournament, matches, results }: BracketPopupProps) {
  const [activeTab, setActiveTab] = useState<'bracket' | 'results'>('bracket');

  if (!isOpen) return null;

  // Organize matches by round (sorted)
  const matchesByRound = matches.reduce((acc, match) => {
    const r = match.round_number;
    if (!acc[r]) acc[r] = [];
    acc[r].push(match);
    return acc;
  }, {} as Record<number, BracketMatch[]>);
  const roundNumbers = Object.keys(matchesByRound).map(Number).sort((a,b)=>a-b);
  roundNumbers.forEach(r => matchesByRound[r].sort((a,b)=>a.match_number - b.match_number));
  const maxRound = roundNumbers.length ? roundNumbers[roundNumbers.length - 1] : 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'IN_PROGRESS':
        return <Clock size={16} className="text-yellow-500" />;
      case 'CANCELLED':
        return <AlertCircle size={16} className="text-red-500" />;
      default:
        return <Clock size={16} className="text-gray-400" />;
    }
  };

  const getRoundName = (roundNumber: number) => {
    const totalRounds = maxRound;
    if (roundNumber === totalRounds) return 'Final';
    if (roundNumber === totalRounds - 1) return 'Semi-Final';
    if (roundNumber === totalRounds - 2) return 'Quarter-Final';
    return `Round ${roundNumber}`;
  };

  const getPlacementBadge = (placement: number) => {
    switch (placement) {
      case 1:
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800"><Trophy size={12} className="mr-1" />1st</span>;
      case 2:
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">🥈 2nd</span>;
      case 3:
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">🥉 3rd</span>;
      default:
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">{placement}th</span>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{tournament.name}</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{tournament.description}</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 px-6">
          <button
            onClick={() => setActiveTab('bracket')}
            className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'bracket'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Tournament Bracket
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'results'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Final Results
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'bracket' ? (
            tournament.format === 'SINGLE_ELIMINATION' && roundNumbers.length > 0 ? (
              <SingleEliminationBracket
                rounds={roundNumbers}
                matchesByRound={matchesByRound}
                getStatusIcon={getStatusIcon}
                getRoundName={getRoundName}
              />
            ) : (
              <div className="space-y-8">
                {roundNumbers.map(roundNumber => (
                  <div key={roundNumber} className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {getRoundName(roundNumber)}
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {matchesByRound[roundNumber].map((match) => (
                        <MatchCard key={match.bracket_id} match={match} getStatusIcon={getStatusIcon} />
                      ))}
                    </div>
                  </div>
                ))}
                {matches.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-gray-500 dark:text-gray-400 text-lg">No bracket data available</div>
                    <p className="text-gray-400 dark:text-gray-500 mt-2">The tournament bracket hasn't been generated yet.</p>
                  </div>
                )}
              </div>
            )
          ) : (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Final Tournament Results</h3>
              
              {results.length > 0 ? (
                <div className="space-y-3">
                  {results
                    .sort((a, b) => a.placement - b.placement)
                    .map((result) => (
                      <div
                        key={result.result_id}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          {getPlacementBadge(result.placement)}
                          <span className="font-medium text-gray-900 dark:text-white">
                            {result.user.name}
                          </span>
                        </div>
                        
                        {result.prize_amount && (
                          <div className="text-right">
                            <div className="font-bold text-green-600 dark:text-green-400">
                              {result.prize_amount} {result.prize_currency?.symbol || 'USD'}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Prize</div>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-500 dark:text-gray-400 text-lg">No results available</div>
                  <p className="text-gray-400 dark:text-gray-500 mt-2">Tournament results haven't been finalized yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Small card used in fallback/grid views
function MatchCard({ match, getStatusIcon }: { match: BracketMatch; getStatusIcon: (s: string)=>React.ReactElement }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Match {match.match_number}</span>
        <div className="flex items-center space-x-2">
          {getStatusIcon(match.status)}
          <span className="text-xs text-gray-500 dark:text-gray-400">{match.status}</span>
        </div>
      </div>
      <div className="space-y-2">
        <div className={`flex justify-between items-center p-2 rounded ${match.winner_id === match.player1_id ? 'bg-green-100 dark:bg-green-900' : 'bg-white dark:bg-gray-600'}`}>
          <span className="font-medium text-gray-900 dark:text-white">{match.player1?.name || 'TBD'}</span>
          <span className="font-bold text-lg">{match.status === 'COMPLETED' ? match.player1_score : '-'}</span>
        </div>
        <div className="text-center text-gray-500 dark:text-gray-400 text-sm">vs</div>
        <div className={`flex justify-between items-center p-2 rounded ${match.winner_id === match.player2_id ? 'bg-green-100 dark:bg-green-900' : 'bg-white dark:bg-gray-600'}`}>
          <span className="font-medium text-gray-900 dark:text-white">{match.player2?.name || 'TBD'}</span>
          <span className="font-bold text-lg">{match.status === 'COMPLETED' ? match.player2_score : '-'}</span>
        </div>
      </div>
      {match.scheduled_time && (
        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">Scheduled: {new Date(match.scheduled_time).toLocaleString()}</div>
      )}
    </div>
  );
}

// Columnar single-elimination bracket with connectors
function SingleEliminationBracket({
  rounds,
  matchesByRound,
  getStatusIcon,
  getRoundName,
}: {
  rounds: number[];
  matchesByRound: Record<number, BracketMatch[]>;
  getStatusIcon: (s: string) => React.ReactElement;
  getRoundName: (r: number) => string;
}) {
  const matchHeight = 84; // px
  const vGap = 28; // px
  const row = matchHeight + vGap;

  // total height is based on first round count
  const firstRound = rounds[0];
  const totalRows = (matchesByRound[firstRound]?.length || 1);
  const containerHeight = Math.max(240, totalRows * row);

  return (
    <div className="relative overflow-x-auto">
      <div className="relative flex items-start gap-8 min-w-max pb-6">
        {rounds.map((roundNumber, rIdx) => {
          const matches = matchesByRound[roundNumber] || [];
          const step = Math.pow(2, rIdx) * row;
          const offset = (Math.pow(2, rIdx) - 1) * row / 2;
          const colWidth = 240; // base column width

          return (
            <div key={roundNumber} className="relative" style={{ width: colWidth, height: containerHeight }}>
              <div className="sticky top-0 z-10 -mt-2 mb-2">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">{getRoundName(roundNumber)}</h3>
              </div>
              {/* Matches */}
              <div className="absolute inset-0">
                {matches.map((match, idx) => {
                  const top = offset + idx * step;
                  return (
                    <div key={match.bracket_id} className="absolute left-0 right-8" style={{ top, height: matchHeight }}>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-3 border shadow-sm h-full flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Match {match.match_number}</span>
                          <div className="flex items-center space-x-1">{getStatusIcon(match.status)}</div>
                        </div>
                        <div className="space-y-1">
                          <div className={`flex justify-between items-center px-2 py-1 rounded ${match.winner_id === match.player1_id ? 'bg-green-100 dark:bg-green-900' : 'bg-white dark:bg-gray-600'}`}>
                            <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{match.player1?.name || 'TBD'}</span>
                            <span className="text-sm font-bold">{match.status === 'COMPLETED' ? match.player1_score : '-'}</span>
                          </div>
                          <div className="text-center text-gray-500 dark:text-gray-400 text-xs">vs</div>
                          <div className={`flex justify-between items-center px-2 py-1 rounded ${match.winner_id === match.player2_id ? 'bg-green-100 dark:bg-green-900' : 'bg-white dark:bg-gray-600'}`}>
                            <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{match.player2?.name || 'TBD'}</span>
                            <span className="text-sm font-bold">{match.status === 'COMPLETED' ? match.player2_score : '-'}</span>
                          </div>
                        </div>
                      </div>
                      {/* Right connector arm (except last round) */}
                      {rIdx < rounds.length - 1 && (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 h-0.5 bg-gray-300 dark:bg-gray-600" style={{ width: 24 }} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Merge connectors between pairs (except last column) */}
              {rIdx < rounds.length - 1 && (
                <div className="absolute inset-0 pointer-events-none">
                  {Array.from({ length: Math.ceil(matches.length / 2) }).map((_, pairIdx) => {
                    const y1 = offset + (pairIdx * 2) * step + matchHeight / 2;
                    const y2 = offset + (pairIdx * 2 + 1) * step + matchHeight / 2;
                    const yMid = (y1 + y2) / 2;
                    return (
                      <div key={pairIdx} className="absolute right-0" style={{ top: y1, height: y2 - y1, width: 24 }}>
                        {/* vertical */}
                        <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600" />
                        {/* short to next col from mid */}
                        <div className="absolute right-0 text-gray-300 dark:text-gray-600" style={{ top: (y2 - y1)/2 - 1, height: 2, width: 24, backgroundColor: 'currentColor' }} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
