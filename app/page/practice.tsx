"use client";

import React from "react";
import { IconUser } from "@tabler/icons-react";

const Practice: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 p-6">

      {/* DOFUS Section (now at top) */}
      <div className="w-96 h-[458px] relative bg-gradient-to-b from-slate-800 to-slate-800/0 overflow-hidden mb-6">
        <div className="left-[24px] top-[369px] absolute inline-flex justify-start items-center gap-36">
          <div className="inline-flex flex-col justify-start items-start gap-1">
            <div className="justify-center text-white text-xs font-normal font-['Figtree'] tracking-wide">
              DOFUS
            </div>
            <div className="justify-center text-white text-xl font-bold font-['Figtree'] tracking-wide">
              Goultarminator #11
            </div>
            <div className="inline-flex justify-start items-center gap-2">
              <div className="justify-center text-white text-base font-medium font-['Figtree'] tracking-wide">
                05.04.2023
              </div>
              <div className="w-1 h-1 bg-blue-100 rounded-full" />
              <div className="justify-center text-white text-base font-medium font-['Figtree'] tracking-wide">
                15:00
              </div>
            </div>
          </div>
          <div
            data-has-content="false"
            data-has-icon-left="true"
            data-has-icon-right="false"
            data-size="Default"
            data-state="Actif"
            data-type="Secondary"
            className="h-12 p-3 bg-violet-100 rounded-[20px] flex justify-center items-center gap-1"
          >
            <div className="w-6 h-6 relative overflow-hidden">
              <div className="w-2 h-3 left-[8.59px] top-[6px] absolute bg-violet-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Card Section */}
      <div className="w-96 inline-flex flex-col justify-start items-start gap-4 p-4 bg-white rounded-xl shadow-lg">
        <div className="flex items-center gap-3">
          <IconUser size={32} className="text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">Dark League Events</h2>
        </div>

        <div className="w-full inline-flex justify-start items-start gap-6 overflow-x-auto">
          {/* Card 1 */}
          <div className="w-72 h-48 relative bg-gradient-to-b from-gray-700/0 to-slate-800/80 rounded-xl flex-shrink-0">
            <div className="absolute left-3 bottom-3 flex flex-col gap-1">
              <div className="text-white text-base font-semibold">Valorant</div>
              <div className="flex items-center gap-2 text-indigo-50 text-sm font-medium">
                <span>05.05.23</span>
                <span className="w-1 h-1 bg-blue-100 rounded-full" />
                <span>19:00</span>
              </div>
            </div>
            <div className="absolute right-3 top-2 h-6 px-2 bg-violet-600 rounded-lg flex items-center justify-center text-sky-50 text-xs font-medium">
              Valorant
            </div>
          </div>

          {/* Card 2 */}
          <div className="w-72 h-48 relative bg-gradient-to-b from-gray-700/0 to-slate-800/80 rounded-xl flex-shrink-0">
            <div className="absolute left-3 bottom-3 flex flex-col gap-1">
              <div className="text-white text-base font-semibold">League of Legends</div>
              <div className="flex items-center gap-2 text-indigo-50 text-sm font-medium">
                <span>07.05.23</span>
                <span className="w-1 h-1 bg-blue-100 rounded-full" />
                <span>15:00</span>
              </div>
            </div>
            <div className="absolute right-3 top-2 h-6 px-2 bg-violet-600 rounded-lg flex items-center justify-center text-sky-50 text-xs font-medium">
              League of Legends
            </div>
          </div>

          {/* Card 3 */}
          <div className="w-72 h-48 relative bg-gradient-to-b from-gray-700/0 to-slate-800/80 rounded-xl flex-shrink-0">
            <div className="absolute left-3 bottom-3 flex flex-col gap-1">
              <div className="text-white text-base font-semibold">Mobile Legends</div>
              <div className="flex items-center gap-2 text-indigo-50 text-sm font-medium">
                <span>09.05.23</span>
                <span className="w-1 h-1 bg-blue-100 rounded-full" />
                <span>16:00</span>
              </div>
            </div>
            <div className="absolute right-3 top-2 h-6 px-2 bg-violet-600 rounded-lg flex items-center justify-center text-sky-50 text-xs font-medium">
              Mobile Legends
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Practice;
