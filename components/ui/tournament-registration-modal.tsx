"use client";

import { useState, useEffect } from 'react';
import { X, Users, Calendar, DollarSign, Trophy, CheckCircle, AlertTriangle } from 'lucide-react';

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

interface RegisteredPlayer {
  user_id: string;
  name: string;
  email: string;
  registration_date: string;
}

interface TournamentRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournament: Tournament | null;
  onRegister: (tournamentId: string) => void;
  isRegistering: boolean;
}

export default function TournamentRegistrationModal({
  isOpen,
  onClose,
  tournament,
  onRegister,
  isRegistering
}: TournamentRegistrationModalProps) {
  const [registeredPlayers, setRegisteredPlayers] = useState<RegisteredPlayer[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(false);

  useEffect(() => {
    if (isOpen && tournament) {
      fetchRegisteredPlayers();
    }
  }, [isOpen, tournament]);

  const fetchRegisteredPlayers = async () => {
    if (!tournament) return;
    
    setLoadingPlayers(true);
    try {
      const response = await fetch(`/api/tournaments/${tournament.tournament_id}/registrations`);
      if (response.ok) {
        const players = await response.json();
        setRegisteredPlayers(Array.isArray(players) ? players : []);
      }
    } catch (error) {
      console.error('Error fetching registered players:', error);
    } finally {
      setLoadingPlayers(false);
    }
  };

  if (!isOpen || !tournament) return null;

  const isFree = tournament.entry_fee_amount === "0";
  const canRegister = tournament.registration_count < tournament.max_participants && tournament.status === 'UPCOMING';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Join Tournament
              </h2>
              <h3 className="text-lg text-gray-700 dark:text-gray-300 mt-1">
                {tournament.name}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Tournament Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">Tournament Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-blue-600" />
                <span className="text-blue-700 dark:text-blue-300">
                  <strong>Format:</strong> {tournament.format.replace('_', ' ')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-blue-600" />
                <span className="text-blue-700 dark:text-blue-300">
                  <strong>Entry Fee:</strong> {isFree ? 'Free' : `${tournament.entry_fee_amount} ${tournament.currency_symbol || 'USD'}`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-blue-700 dark:text-blue-300">
                  <strong>Participants:</strong> {tournament.registration_count}/{tournament.max_participants}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-blue-700 dark:text-blue-300">
                  <strong>Starts:</strong> {new Date(tournament.start_date).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {tournament.description && (
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h4>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                {tournament.description}
              </p>
            </div>
          )}

          {/* Registered Players */}
          {tournament.status === 'UPCOMING' && (
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Registered Players ({registeredPlayers.length})
              </h4>
              
              {loadingPlayers ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Loading players...</p>
                </div>
              ) : registeredPlayers.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {registeredPlayers.map((player, index) => (
                    <div key={player.user_id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <span className="text-blue-800 dark:text-blue-200 font-semibold text-sm">
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {player.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Registered: {new Date(player.registration_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">No players registered yet</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">Be the first to join!</p>
                </div>
              )}
            </div>
          )}

          {/* Registration Status */}
          {!canRegister && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <span className="font-medium text-yellow-800 dark:text-yellow-200">
                  {tournament.status !== 'UPCOMING' 
                    ? 'Tournament has already started' 
                    : 'Tournament is full'
                  }
                </span>
              </div>
            </div>
          )}

          {canRegister && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800 dark:text-green-200">
                  Ready to Join
                </span>
              </div>
              <p className="text-green-700 dark:text-green-300 text-sm">
                {isFree 
                  ? "This tournament is free to join. Click register to secure your spot!"
                  : `Entry fee of ${tournament.entry_fee_amount} ${tournament.currency_symbol || 'USD'} will be charged upon registration.`
                }
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              disabled={isRegistering}
            >
              Cancel
            </button>
            {canRegister && (
              <button
                onClick={() => onRegister(tournament.tournament_id)}
                disabled={isRegistering}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isRegistering ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Registering...
                  </>
                ) : (
                  <>
                    <Users size={16} />
                    Register Now
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
