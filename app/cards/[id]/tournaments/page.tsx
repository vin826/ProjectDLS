"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, Calendar, Users, DollarSign, Clock, Award } from 'lucide-react';
import BracketPopup from '@/components/ui/bracket-popup';
import TournamentRegistrationModal from '@/components/ui/tournament-registration-modal';

interface Tournament {
  tournament_id: string;
  name: string;
  description?: string;
  format: string;
  status: string;
  start_date: string;
  end_date: string;
  entry_fee_amount: string;
  currency_symbol?: string;
  max_participants: number;
  registration_count: number;
}

interface TournamentResult {
  result_id: string;
  placement: number;
  prize_amount?: string;
  user: { name: string; user_id: string };
  prize_currency?: { symbol: string };
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
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  scheduled_time?: string;
  completed_time?: string;
  player1?: { name: string; user_id: string };
  player2?: { name: string; user_id: string };
  winner?: { name: string; user_id: string };
}

interface Card {
  card_id: number;
  title: string;
  content: string;
}

interface CardTournamentsPageProps {
  params: Promise<{ id: string }>;
}

export default function CardTournamentsPage({ params }: CardTournamentsPageProps) {
  const [cardId, setCardId] = useState<string>('');
  const [card, setCard] = useState<Card | null>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [tournamentResults, setTournamentResults] = useState<TournamentResult[]>([]);
  const [bracketMatches, setBracketMatches] = useState<BracketMatch[]>([]);
  const [showBracket, setShowBracket] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [selectedTournamentForRegistration, setSelectedTournamentForRegistration] = useState<Tournament | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setCardId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (cardId) {
      fetchCardAndTournaments();
    }
  }, [cardId]);

  const fetchCardAndTournaments = async () => {
    try {
      console.log(`Fetching tournaments for card ID: ${cardId}`);
      const response = await fetch(`/api/cards/${cardId}/tournaments`);
      if (response.ok) {
        const data = await response.json();
        console.log('API Response:', data);
        setCard(data.card);
        setTournaments(data.tournaments);
      } else {
        console.error('API response not ok:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
      }
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTournamentDetails = async (tournament: Tournament) => {
    try {
      // Fetch tournament results
      const resultsResponse = await fetch(`/api/tournaments/${tournament.tournament_id}/results`);
      const results = resultsResponse.ok ? await resultsResponse.json() : [];

      // Fetch bracket matches
      const bracketsResponse = await fetch(`/api/tournaments/${tournament.tournament_id}/brackets`);
      const brackets = bracketsResponse.ok ? await bracketsResponse.json() : [];

      setTournamentResults(results);
      setBracketMatches(brackets);
      setSelectedTournament(tournament);
      setShowBracket(true);
    } catch (error) {
      console.error('Error fetching tournament details:', error);
    }
  };

  const handleRegistrationClick = (tournament: Tournament, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the card click event
    setSelectedTournamentForRegistration(tournament);
    setShowRegistrationModal(true);
  };

  const handleRegister = async (tournamentId: string) => {
    setIsRegistering(true);
    try {
      // For demo purposes, using a mock user ID
      // In a real app, you'd get this from authentication context
      const mockUserId = "3a7e1b5d-9c2f-4e8b-a3d6-f1b0c5e4d9a2"; // Replace with actual user ID
      
      const response = await fetch(`/api/tournaments/${tournamentId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: mockUserId })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Registration successful:', result);
        
        // Refresh tournaments to show updated registration count
        await fetchCardAndTournaments();
        setShowRegistrationModal(false);
        
        // Show success message (you could use a toast library here)
        alert('Successfully registered for the tournament!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to register for tournament');
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      alert('Failed to register for tournament');
    } finally {
      setIsRegistering(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'UPCOMING':
        return <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">Upcoming</span>;
      case 'ONGOING':
        return <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">Live</span>;
      case 'COMPLETED':
        return <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">Completed</span>;
      default:
        return <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const getTopPlayers = (results: TournamentResult[]) => {
    return results
      .sort((a, b) => a.placement - b.placement)
      .slice(0, 3);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading tournaments...</div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Card not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-[100svh] bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-3 py-4 sm:px-4 sm:py-8">
        <div className="mb-4 sm:mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
            ← Back to Events
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold mt-2 sm:mt-4 text-gray-900 dark:text-white">{card.title} - Tournaments</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 sm:mt-2 text-sm sm:text-base">{card.content}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {tournaments.map((tournament) => (
            <div 
              key={tournament.tournament_id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer"
              onClick={() => fetchTournamentDetails(tournament)}
            >
              <div className="p-4 sm:p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{tournament.name}</h3>
                  {getStatusBadge(tournament.status)}
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 text-sm sm:text-base">{tournament.description}</p>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Trophy className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">Format:</span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {tournament.format.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">Entry Fee:</span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {tournament.entry_fee_amount} {tournament.currency_symbol || 'USD'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">Participants:</span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {tournament.registration_count}/{tournament.max_participants}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">Date:</span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {new Date(tournament.start_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Tournament Status Actions */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  {tournament.status === 'UPCOMING' && (
                    <button
                      onClick={(e) => handleRegistrationClick(tournament, e)}
                      className="w-full bg-blue-600 text-white text-center py-2 rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                      <Users className="w-4 h-4" />
                      Register Now
                    </button>
                  )}
                  {tournament.status === 'ONGOING' && (
                    <div className="bg-green-600 text-white text-center py-2 rounded hover:bg-green-700 transition-colors">
                      <Clock className="w-4 h-4 inline mr-2" />
                      View Live Bracket
                    </div>
                  )}
                  {tournament.status === 'COMPLETED' && (
                    <div className="bg-gray-600 text-white text-center py-2 rounded hover:bg-gray-700 transition-colors">
                      <Award className="w-4 h-4 inline mr-2" />
                      View Results & Bracket
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {tournaments.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400 text-lg">No tournaments available yet</div>
            <p className="text-gray-400 dark:text-gray-500 mt-2">Check back soon for upcoming tournaments!</p>
          </div>
        )}
      </div>

      {/* Bracket Popup */}
      {selectedTournament && (
        <BracketPopup
          isOpen={showBracket}
          onClose={() => setShowBracket(false)}
          tournament={selectedTournament}
          matches={bracketMatches}
          results={tournamentResults}
        />
      )}

      {/* Tournament Registration Modal */}
      <TournamentRegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        tournament={selectedTournamentForRegistration}
        onRegister={handleRegister}
        isRegistering={isRegistering}
      />
    </div>
  );
}
