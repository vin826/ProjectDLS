"use client";

import { useState, useEffect } from "react";
import { Trophy, Plus, Edit, Save, X, Users, Calendar, DollarSign, Settings, Play, CheckCircle, Clock, AlertTriangle, Trash2 } from "lucide-react";

interface Tournament {
  tournament_id: string;
  name: string;
  description?: string;
  format: string;
  status: string;
  start_date: string;
  end_date: string;
  entry_fee_amount: string;
  max_participants: number;
  currency_symbol?: string;
  registration_count: number;
  card_id?: number;
}

interface TournamentFormData {
  name: string;
  description: string;
  format: string;
  start_date: string;
  end_date: string;
  entry_fee_amount: string;
  is_free: boolean;
  max_participants: number;
  card_id: string;
}

interface Card {
  card_id: number;
  title: string;
}

interface BracketMatch {
  bracket_id: string;
  round_number: number;
  match_number: number;
  player1_id?: string;
  player2_id?: string;
  winner_id?: string;
  player1_score: number;
  player2_score: number;
  status: string;
  player1?: { name: string; user_id: string };
  player2?: { name: string; user_id: string };
}

interface User {
  user_id: string;
  name: string;
}

interface RegisteredPlayer {
  user_id: string;
  name: string;
  email: string;
  registration_date: string;
  registration_id: string;
}

export default function TournamentManager() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [registeredPlayers, setRegisteredPlayers] = useState<RegisteredPlayer[]>([]);
  const [playerOrder, setPlayerOrder] = useState<RegisteredPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBracketModal, setShowBracketModal] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [brackets, setBrackets] = useState<BracketMatch[]>([]);
  const [editingMatch, setEditingMatch] = useState<string | null>(null);
  const [generatingBrackets, setGeneratingBrackets] = useState(false);
  const [startingTournament, setStartingTournament] = useState(false);
  const [deletingTournament, setDeletingTournament] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Tournament | null>(null);
  
  const [formData, setFormData] = useState<TournamentFormData>({
    name: "",
    description: "",
    format: "SINGLE_ELIMINATION",
    start_date: "",
    end_date: "",
    entry_fee_amount: "0",
    is_free: true,
    max_participants: 16,
    card_id: ""
  });

  const tournamentFormats = [
    { value: "SINGLE_ELIMINATION", label: "Single Elimination" },
    { value: "DOUBLE_ELIMINATION", label: "Double Elimination" },
    { value: "ROUND_ROBIN", label: "Round Robin" },
    { value: "SWISS_SYSTEM", label: "Swiss System" },
    { value: "BEST_OF_SERIES", label: "Best of Series" }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch tournaments
      const tournamentsResponse = await fetch('/api/tournaments');
      const tournamentsData = await tournamentsResponse.json();
      setTournaments(Array.isArray(tournamentsData) ? tournamentsData : []);

      // Fetch cards
      const cardsResponse = await fetch('/api/cards');
      const cardsData = await cardsResponse.json();
      // Handle both direct array and {data: array} response structures
      const cards = cardsData.data || cardsData;
      console.log('📋 Cards fetched:', cards.length, 'cards available');
      setCards(Array.isArray(cards) ? cards : []);

      // Fetch users
      const usersResponse = await fetch('/api/users');
      const usersData = await usersResponse.json();
      setUsers(Array.isArray(usersData) ? usersData : []);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          card_id: formData.card_id ? parseInt(formData.card_id) : null,
          entry_fee_amount: formData.is_free ? "0" : formData.entry_fee_amount
        })
      });

      if (response.ok) {
        await fetchData();
        setShowCreateModal(false);
        setFormData({
          name: "",
          description: "",
          format: "SINGLE_ELIMINATION",
          start_date: "",
          end_date: "",
          entry_fee_amount: "0",
          is_free: true,
          max_participants: 16,
          card_id: ""
        });
      }
    } catch (error) {
      console.error('Error creating tournament:', error);
    }
  };

  const fetchBrackets = async (tournamentId: string) => {
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/brackets`);
      const data = await response.json();
      setBrackets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching brackets:', error);
      setBrackets([]);
    }
  };

  const fetchRegisteredPlayers = async (tournamentId: string) => {
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/registrations`);
      const data = await response.json();
      setRegisteredPlayers(Array.isArray(data) ? data : []);
      setPlayerOrder(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching registered players:', error);
      setRegisteredPlayers([]);
      setPlayerOrder([]);
    }
  };

  const randomizePlayerOrder = () => {
    const shuffled = [...registeredPlayers];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setPlayerOrder(shuffled);
  };

  const startTournament = async (tournamentId: string) => {
    if (playerOrder.length < 2) {
      alert('Need at least 2 players to start the tournament');
      return;
    }

    setStartingTournament(true);
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerOrder: playerOrder.map(p => p.user_id)
        })
      });

      if (response.ok) {
        console.log('✅ Tournament started successfully');
        await fetchBrackets(tournamentId);
        // Refresh tournament data to update status
        await fetchData();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to start tournament');
      }
    } catch (error) {
      console.error('❌ Error starting tournament:', error);
      alert('Failed to start tournament');
    } finally {
      setStartingTournament(false);
    }
  };

  const deleteTournament = async (tournamentId: string) => {
    setDeletingTournament(tournamentId);
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        console.log('✅ Tournament deleted successfully');
        await fetchData(); // Refresh tournament list
        setShowDeleteConfirm(null);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete tournament');
      }
    } catch (error) {
      console.error('❌ Error deleting tournament:', error);
      alert('Failed to delete tournament');
    } finally {
      setDeletingTournament(null);
    }
  };

  const generateBrackets = async (tournamentId: string) => {
    setGeneratingBrackets(true);
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/generate-brackets`, {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ Brackets generated successfully');
        await fetchBrackets(tournamentId);
      } else if (response.status === 400) {
        // Handle the "brackets already exist" case
        console.log('ℹ️ Brackets already exist for this tournament');
        // Just refresh the brackets to show the existing ones
        await fetchBrackets(tournamentId);
      } else {
        console.error('❌ Error generating brackets:', data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('❌ Network error generating brackets:', error);
    } finally {
      setGeneratingBrackets(false);
    }
  };

  const updateMatch = async (matchId: string, updateData: any) => {
    try {
      const response = await fetch(`/api/tournaments/brackets/${matchId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      
      if (response.ok) {
        await fetchBrackets(selectedTournament!.tournament_id);
        setEditingMatch(null);
      }
    } catch (error) {
      console.error('Error updating match:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded text-xs font-medium";
    switch (status) {
      case 'UPCOMING':
        return <span className={`${baseClasses} bg-blue-100 text-blue-800`}><Clock size={12} className="inline mr-1" />Upcoming</span>;
      case 'ONGOING':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}><Play size={12} className="inline mr-1" />Live</span>;
      case 'COMPLETED':
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}><CheckCircle size={12} className="inline mr-1" />Completed</span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{status}</span>;
    }
  };

  const getMatchStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'IN_PROGRESS':
        return <Play size={16} className="text-blue-500" />;
      case 'CANCELLED':
        return <AlertTriangle size={16} className="text-red-500" />;
      default:
        return <Clock size={16} className="text-gray-400" />;
    }
  };

  const organizeMatchesByRound = (matches: BracketMatch[]) => {
    return matches.reduce((acc, match) => {
      if (!acc[match.round_number]) {
        acc[match.round_number] = [];
      }
      acc[match.round_number].push(match);
      return acc;
    }, {} as Record<number, BracketMatch[]>);
  };

  const getRoundName = (roundNumber: number, totalRounds: number) => {
    if (roundNumber === totalRounds) return 'Final';
    if (roundNumber === totalRounds - 1) return 'Semi-Final';
    if (roundNumber === totalRounds - 2) return 'Quarter-Final';
    return `Round ${roundNumber}`;
  };

  if (loading) {
    return <div className="text-center py-8">Loading tournaments...</div>;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-500" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tournament Manager</h2>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Create Tournament
        </button>
      </div>

      {/* Tournaments Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.isArray(tournaments) && tournaments.map((tournament) => (
          <div key={tournament.tournament_id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{tournament.name}</h3>
              {getStatusBadge(tournament.status)}
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">{tournament.description}</p>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Format:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {tournament.format.replace('_', ' ')}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Entry Fee:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {tournament.entry_fee_amount === "0" ? "Free" : `${tournament.entry_fee_amount} ${tournament.currency_symbol || 'USD'}`}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Participants:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {tournament.registration_count}/{tournament.max_participants}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Date:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {new Date(tournament.start_date).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
              <button
                onClick={() => {
                  setSelectedTournament(tournament);
                  setShowBracketModal(true);
                  fetchBrackets(tournament.tournament_id);
                  fetchRegisteredPlayers(tournament.tournament_id);
                }}
                className="flex-1 px-3 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors flex items-center justify-center gap-1"
              >
                <Settings size={14} />
                Manage Brackets
              </button>
              <button
                onClick={() => setShowDeleteConfirm(tournament)}
                className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors flex items-center justify-center gap-1"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {tournaments.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No tournaments created yet</p>
        </div>
      )}

      {/* Create Tournament Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Create New Tournament</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X size={20} />
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateTournament} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tournament Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Associated Card
                  </label>
                  <select
                    value={formData.card_id}
                    onChange={(e) => setFormData({...formData, card_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select a card (optional)</option>
                    {Array.isArray(cards) && cards.map(card => (
                      <option key={card.card_id} value={card.card_id}>{card.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Format
                  </label>
                  <select
                    value={formData.format}
                    onChange={(e) => setFormData({...formData, format: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    {tournamentFormats.map(format => (
                      <option key={format.value} value={format.value}>{format.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Max Participants
                  </label>
                  <input
                    type="number"
                    min="4"
                    max="256"
                    value={formData.max_participants}
                    onChange={(e) => setFormData({...formData, max_participants: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Date
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-2">
                  <input
                    type="checkbox"
                    id="is_free"
                    checked={formData.is_free}
                    onChange={(e) => setFormData({...formData, is_free: e.target.checked, entry_fee_amount: e.target.checked ? "0" : formData.entry_fee_amount})}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="is_free" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Free Tournament
                  </label>
                </div>

                {!formData.is_free && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Entry Fee Amount
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.entry_fee_amount}
                      onChange={(e) => setFormData({...formData, entry_fee_amount: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Tournament
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bracket Management Modal */}
      {showBracketModal && selectedTournament && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {selectedTournament.name} - Bracket Management
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Manage matches and track tournament progress
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {Array.isArray(brackets) && brackets.length === 0 && selectedTournament.status === 'UPCOMING' ? (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={randomizePlayerOrder}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <Users size={16} />
                        Randomize Order
                      </button>
                      <button
                        onClick={() => startTournament(selectedTournament.tournament_id)}
                        disabled={startingTournament || playerOrder.length < 2}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {startingTournament ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Starting...
                          </>
                        ) : (
                          <>
                            <Play size={16} />
                            Start Tournament
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    brackets.length === 0 && (
                      <button
                        onClick={() => generateBrackets(selectedTournament.tournament_id)}
                        disabled={generatingBrackets}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {generatingBrackets ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Generating...
                          </>
                        ) : (
                          'Generate Brackets'
                        )}
                      </button>
                    )
                  )}
                  <button
                    onClick={() => setShowBracketModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {Array.isArray(brackets) && brackets.length > 0 ? (
                (() => {
                  const rounds = Object.entries(organizeMatchesByRound(brackets)).sort(
                    ([a], [b]) => parseInt(a) - parseInt(b)
                  );

                  // Only render full bracket visualization for Single Elimination
                  if (selectedTournament?.format === 'SINGLE_ELIMINATION') {
                    const CARD_H = 84; // px
                    const GAP = 24; // px
                    const UNIT = CARD_H + GAP;
                    const firstRoundMatches = rounds[0]?.[1]?.length || 1;
                    const bracketHeight = Math.max(UNIT * firstRoundMatches - GAP, CARD_H);

                    const getOffset = (roundNum: number) => {
                      if (roundNum <= 1) return 0;
                      return UNIT * (Math.pow(2, roundNum - 2) - 0.5);
                    };
                    const getSpacing = (roundNum: number) => UNIT * Math.pow(2, roundNum - 1);

                    return (
                      <div className="relative overflow-x-auto">
                        <div
                          className="relative flex items-stretch gap-10 pr-6"
                          style={{ minHeight: bracketHeight }}
                        >
                          {rounds.map(([roundNumStr, matches], colIdx) => {
                            const roundNum = parseInt(roundNumStr);
                            const offset = getOffset(roundNum);
                            const spacing = getSpacing(roundNum);
                            return (
                              <div
                                key={roundNum}
                                className="relative"
                                style={{ minHeight: bracketHeight, width: 280 }}
                              >
                                <div className="mb-3 pl-2">
                                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                                    {getRoundName(roundNum, Math.max(...brackets.map(b => b.round_number)))}
                                  </h4>
                                </div>

                                {/* Match cards positioned vertically with connector arms */}
                                {matches
                                  .sort((a, b) => a.match_number - b.match_number)
                                  .map((match) => {
                                    const top = offset + (match.match_number - 1) * spacing;
                                    return (
                                      <div
                                        key={match.bracket_id}
                                        className="absolute left-0 w-[260px]"
                                        style={{ top, height: CARD_H }}
                                      >
                                        <div className="relative h-full bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600 shadow-sm">
                                          <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                                              Match {match.match_number}
                                            </span>
                                            <div className="flex items-center gap-2">
                                              {getMatchStatusIcon(match.status)}
                                              {editingMatch === match.bracket_id ? (
                                                <button
                                                  onClick={() => setEditingMatch(null)}
                                                  className="text-green-600 hover:text-green-700"
                                                >
                                                  <Save size={14} />
                                                </button>
                                              ) : (
                                                <button
                                                  onClick={() => setEditingMatch(match.bracket_id)}
                                                  className="text-blue-600 hover:text-blue-700"
                                                >
                                                  <Edit size={14} />
                                                </button>
                                              )}
                                            </div>
                                          </div>

                                          <div className="space-y-1">
                                            <div className={`flex justify-between items-center p-2 rounded ${
                                              match.winner_id === match.player1_id ? 'bg-green-100 dark:bg-green-900 ring-1 ring-green-400' : 'bg-white dark:bg-gray-600'
                                            }`}>
                                              <div className="flex-1 min-w-0">
                                                {editingMatch === match.bracket_id ? (
                                                  <select className="w-full text-sm bg-transparent border-none focus:outline-none">
                                                    <option value="">Select Player</option>
                                                    {Array.isArray(users) && users.map(user => (
                                                      <option key={user.user_id} value={user.user_id} selected={user.user_id === match.player1_id}>
                                                        {user.name}
                                                      </option>
                                                    ))}
                                                  </select>
                                                ) : (
                                                  <span className="font-medium text-gray-900 dark:text-white truncate">
                                                    {match.player1?.name || 'TBD'}
                                                  </span>
                                                )}
                                              </div>
                                              <div className="ml-2">
                                                {editingMatch === match.bracket_id ? (
                                                  <input
                                                    type="number"
                                                    min="0"
                                                    defaultValue={match.player1_score}
                                                    className="w-10 text-center text-sm bg-transparent border border-gray-300 rounded"
                                                  />
                                                ) : (
                                                  <span className="font-bold">
                                                    {match.status === 'COMPLETED' ? match.player1_score : '-'}
                                                  </span>
                                                )}
                                              </div>
                                            </div>

                                            <div className={`flex justify-between items-center p-2 rounded ${
                                              match.winner_id === match.player2_id ? 'bg-green-100 dark:bg-green-900 ring-1 ring-green-400' : 'bg-white dark:bg-gray-600'
                                            }`}>
                                              <div className="flex-1 min-w-0">
                                                {editingMatch === match.bracket_id ? (
                                                  <select className="w-full text-sm bg-transparent border-none focus:outline-none">
                                                    <option value="">Select Player</option>
                                                    {Array.isArray(users) && users.map(user => (
                                                      <option key={user.user_id} value={user.user_id} selected={user.user_id === match.player2_id}>
                                                        {user.name}
                                                      </option>
                                                    ))}
                                                  </select>
                                                ) : (
                                                  <span className="font-medium text-gray-900 dark:text-white truncate">
                                                    {match.player2?.name || 'TBD'}
                                                  </span>
                                                )}
                                              </div>
                                              <div className="ml-2">
                                                {editingMatch === match.bracket_id ? (
                                                  <input
                                                    type="number"
                                                    min="0"
                                                    defaultValue={match.player2_score}
                                                    className="w-10 text-center text-sm bg-transparent border border-gray-300 rounded"
                                                  />
                                                ) : (
                                                  <span className="font-bold">
                                                    {match.status === 'COMPLETED' ? match.player2_score : '-'}
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          </div>

                                          {/* Connector arms */}
                                          {colIdx < rounds.length - 1 && (
                                            <div className="absolute right-[-20px] top-1/2 w-5 border-t border-gray-300 dark:border-gray-500" />
                                          )}
                                          {colIdx > 0 && (
                                            <div className="absolute left-[-20px] top-1/2 w-5 border-t border-gray-300 dark:border-gray-500" />
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}

                                {/* Vertical connectors joining pairs to the next round */}
                                {matches.length > 1 && (
                                  matches
                                    .sort((a, b) => a.match_number - b.match_number)
                                    .filter((m) => m.match_number % 2 === 0)
                                    .map((m) => {
                                      const upperMid = offset + (m.match_number - 2) * spacing + CARD_H / 2;
                                      const lowerMid = offset + (m.match_number - 1) * spacing + CARD_H / 2;
                                      const height = lowerMid - upperMid;
                                      return (
                                        <div
                                          key={`v-${roundNum}-${m.match_number}`}
                                          className="absolute right-[-20px] border-l border-gray-300 dark:border-gray-500"
                                          style={{ top: upperMid, height }}
                                        />
                                      );
                                    })
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }

                  // Fallback: grid view for other formats
                  return (
                    <div className="space-y-8">
                      {rounds.map(([roundNumber, matches]) => {
                        const totalRounds = Math.max(...brackets.map(b => b.round_number));
                        return (
                          <div key={roundNumber} className="space-y-4">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white border-l-4 border-blue-500 pl-3">
                              {getRoundName(parseInt(roundNumber), totalRounds)}
                            </h4>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                              {matches.map((match) => (
                                <div key={match.bracket_id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                                  <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                      Match {match.match_number}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      {getMatchStatusIcon(match.status)}
                                      {editingMatch === match.bracket_id ? (
                                        <button onClick={() => setEditingMatch(null)} className="text-green-600 hover:text-green-700">
                                          <Save size={14} />
                                        </button>
                                      ) : (
                                        <button onClick={() => setEditingMatch(match.bracket_id)} className="text-blue-600 hover:text-blue-700">
                                          <Edit size={14} />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <div className={`flex justify-between items-center p-2 rounded ${match.winner_id === match.player1_id ? 'bg-green-100 dark:bg-green-900 ring-2 ring-green-400' : 'bg-white dark:bg-gray-600'}`}>
                                      <span className="font-medium text-gray-900 dark:text-white">{match.player1?.name || 'TBD'}</span>
                                      <span className="font-bold text-lg">{match.status === 'COMPLETED' ? match.player1_score : '-'}</span>
                                    </div>
                                    <div className="text-center text-gray-500 dark:text-gray-400 text-sm font-medium">vs</div>
                                    <div className={`flex justify-between items-center p-2 rounded ${match.winner_id === match.player2_id ? 'bg-green-100 dark:bg-green-900 ring-2 ring-green-400' : 'bg-white dark:bg-gray-600'}`}>
                                      <span className="font-medium text-gray-900 dark:text-white">{match.player2?.name || 'TBD'}</span>
                                      <span className="font-bold text-lg">{match.status === 'COMPLETED' ? match.player2_score : '-'}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()
              ) : selectedTournament?.status === 'UPCOMING' ? (
                // Show registered players and tournament setup
                <div className="space-y-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                        Tournament Setup
                      </h3>
                    </div>
                    <p className="text-blue-700 dark:text-blue-200 text-sm">
                      This tournament hasn't started yet. You can randomize the player order and start the tournament when ready.
                    </p>
                    <div className="mt-3 flex items-center gap-4 text-sm">
                      <span className="text-blue-600 dark:text-blue-300">
                        <strong>Format:</strong> {selectedTournament.format.replace('_', ' ')}
                      </span>
                      <span className="text-blue-600 dark:text-blue-300">
                        <strong>Players:</strong> {registeredPlayers.length}/{selectedTournament.max_participants}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Registered Players ({registeredPlayers.length})
                      </h4>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Current seeding order
                      </span>
                    </div>

                    {playerOrder.length > 0 ? (
                      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {playerOrder.map((player, index) => (
                          <div key={player.user_id} className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                            <div className="flex items-center gap-3">
                              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                <span className="text-blue-800 dark:text-blue-200 font-semibold text-sm">
                                  {index + 1}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 className="font-medium text-gray-900 dark:text-white truncate">
                                  {player.name}
                                </h5>
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                  {player.email}
                                </p>
                              </div>
                            </div>
                            <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                              Registered: {new Date(player.registration_date).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Players Registered</h3>
                        <p className="text-gray-500 dark:text-gray-400">
                          Players need to register for this tournament before it can be started.
                        </p>
                      </div>
                    )}

                    {playerOrder.length >= 2 && (
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <h4 className="text-green-900 dark:text-green-100 font-medium">
                            Ready to Start
                          </h4>
                        </div>
                        <p className="text-green-700 dark:text-green-200 text-sm">
                          Tournament has {playerOrder.length} registered players and is ready to begin. 
                          Click "Randomize Order" to shuffle player seeding, then "Start Tournament" to generate brackets.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Trophy className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Brackets Generated</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">Generate tournament brackets to start managing matches</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                  <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Tournament</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">This action cannot be undone</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 dark:text-gray-300">
                  Are you sure you want to delete <strong>"{showDeleteConfirm.name}"</strong>?
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  This will permanently delete:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-500 dark:text-gray-400 mt-1 space-y-1">
                  <li>All tournament brackets and matches</li>
                  <li>All player registrations</li>
                  <li>All tournament results</li>
                  <li>Associated payment transactions</li>
                </ul>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  disabled={deletingTournament === showDeleteConfirm.tournament_id}
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteTournament(showDeleteConfirm.tournament_id)}
                  disabled={deletingTournament === showDeleteConfirm.tournament_id}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {deletingTournament === showDeleteConfirm.tournament_id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Delete Tournament
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
