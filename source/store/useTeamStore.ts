import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "admin" | "manager" | "cashier";

export interface TeamMember {
  id: string;
  name: string;
  role: UserRole;
  pin: string; // Simple PIN for MVP
  active: boolean;
}

interface TeamState {
  members: TeamMember[];
  addMember: (member: Omit<TeamMember, "id" | "active">) => void;
  removeMember: (id: string) => void;
  updateMember: (id: string, updates: Partial<TeamMember>) => void;
  verifyPin: (pin: string) => TeamMember | undefined;
}

export const useTeamStore = create<TeamState>()(
  persist(
    (set, get) => ({
      members: [
        {
          id: "1",
          name: "Administrador",
          role: "admin",
          pin: "0000",
          active: true,
        },
        {
          id: "2",
          name: "Gerente",
          role: "manager",
          pin: "0000",
          active: true,
        },
        { id: "3", name: "Caixa", role: "cashier", pin: "0000", active: true },
      ],
      addMember: (member) =>
        set((state) => ({
          members: [
            ...state.members,
            { ...member, id: Date.now().toString(), active: true },
          ],
        })),
      removeMember: (id) =>
        set((state) => ({
          members: state.members.filter((m) => m.id !== id),
        })),
      updateMember: (id, updates) =>
        set((state) => ({
          members: state.members.map((m) =>
            m.id === id ? { ...m, ...updates } : m,
          ),
        })),
      verifyPin: (pin) => {
        return get().members.find((m) => m.pin === pin && m.active);
      },
    }),
    {
      name: "team-storage",
    },
  ),
);
