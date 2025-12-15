import React, { useState } from "react";
import { useTeamStore, UserRole } from "../../store/useTeamStore";
import {
  Plus,
  Trash2,
  Shield,
  User,
  UserCog,
  KeyRound,
  Check,
  X,
  Eye,
  Edit,
  AlertCircle,
} from "lucide-react";
import {
  useSecurity,
  DEFAULT_ROLE_PERMISSIONS,
  Permission,
} from "../../contexts/SecurityContext";

// Mapeamento de permissões para labels amigáveis
const PERMISSION_LABELS: Record<string, { label: string; category: string }> = {
  "dashboard:view": { label: "Ver Dashboard", category: "Dashboard" },
  "orders:view": { label: "Ver Pedidos", category: "Pedidos" },
  "orders:create": { label: "Criar Pedidos", category: "Pedidos" },
  "orders:edit": { label: "Editar Pedidos", category: "Pedidos" },
  "orders:cancel": { label: "Cancelar Pedidos", category: "Pedidos" },
  "pos:view": { label: "Acessar Caixa", category: "Caixa" },
  "pos:discount": { label: "Aplicar Desconto", category: "Caixa" },
  "pos:open": { label: "Abrir Caixa", category: "Caixa" },
  "pos:close": { label: "Fechar Caixa", category: "Caixa" },
  "catalog:view": { label: "Ver Catálogo", category: "Catálogo" },
  "catalog:edit": { label: "Editar Catálogo", category: "Catálogo" },
  "catalog:delete": { label: "Excluir Itens", category: "Catálogo" },
  "customers:view": { label: "Ver Clientes", category: "Clientes" },
  "customers:edit": { label: "Editar Clientes", category: "Clientes" },
  "chat:view": { label: "Ver Mensagens", category: "Chat" },
  "chat:send": { label: "Enviar Mensagens", category: "Chat" },
  "reports:view": { label: "Ver Relatórios", category: "Relatórios" },
  "creative:view": { label: "Estúdio Criativo", category: "IA" },
  "settings:view": { label: "Ver Configurações", category: "Sistema" },
  "settings:edit": { label: "Editar Configurações", category: "Sistema" },
  "team:view": { label: "Ver Equipe", category: "Equipe" },
  "team:edit": { label: "Gerenciar Equipe", category: "Equipe" },
};

const SettingsTeam = () => {
  const { members, addMember, removeMember, updateMember } = useTeamStore();
  const { currentUser, hasPermission } = useSecurity();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPermissions, setShowPermissions] = useState(false);
  const [newMember, setNewMember] = useState({
    name: "",
    role: "cashier" as UserRole,
    pin: "",
  });

  const canManageTeam =
    hasPermission("team:edit") || currentUser?.role === "admin";

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageTeam) {
      alert("Você não tem permissão para gerenciar a equipe.");
      return;
    }
    if (newMember.name && newMember.pin.length === 4) {
      addMember(newMember);
      setNewMember({ name: "", role: "cashier", pin: "" });
      setIsAdding(false);
    } else {
      alert("Preencha todos os campos. PIN deve ter 4 dígitos.");
    }
  };

  const handleRemoveMember = (id: string) => {
    if (!canManageTeam) {
      alert("Você não tem permissão para gerenciar a equipe.");
      return;
    }
    if (confirm("Tem certeza que deseja remover este usuário?")) {
      removeMember(id);
    }
  };

  const handleUpdatePin = (id: string, newPin: string) => {
    if (newPin.length === 4 && /^\d+$/.test(newPin)) {
      updateMember(id, { pin: newPin });
      setEditingId(null);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case "admin":
        return (
          <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-bold uppercase border border-red-500/30">
            Admin
          </span>
        );
      case "manager":
        return (
          <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs font-bold uppercase border border-purple-500/30">
            Gerente
          </span>
        );
      case "cashier":
        return (
          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-bold uppercase border border-blue-500/30">
            Caixa
          </span>
        );
    }
  };

  const getRoleDescription = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "Acesso total ao sistema";
      case "manager":
        return "Gerencia operações diárias";
      case "cashier":
        return "Operações de venda básicas";
    }
  };

  // Agrupar permissões por categoria
  const groupedPermissions = Object.entries(PERMISSION_LABELS).reduce(
    (acc, [key, value]) => {
      if (!acc[value.category]) acc[value.category] = [];
      acc[value.category].push({ key, ...value });
      return acc;
    },
    {} as Record<string, { key: string; label: string; category: string }[]>,
  );

  const hasRolePermission = (role: UserRole, permission: string): boolean => {
    const perms = DEFAULT_ROLE_PERMISSIONS[role];
    return perms.includes("*") || perms.includes(permission as Permission);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-white">Equipe e Permissões</h3>
          <p className="text-sm text-zinc-400">
            Gerencie quem tem acesso ao sistema.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPermissions(!showPermissions)}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors text-sm font-medium"
          >
            <Eye className="w-4 h-4" />
            {showPermissions ? "Ocultar Matriz" : "Ver Matriz"}
          </button>
          {canManageTeam && (
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Adicionar Membro
            </button>
          )}
        </div>
      </div>

      {/* Mensagem de permissão */}
      {!canManageTeam && (
        <div className="flex items-center gap-2 px-4 py-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>
            Você está visualizando a equipe. Apenas administradores podem fazer
            alterações.
          </span>
        </div>
      )}

      {/* Matriz de Permissões */}
      {showPermissions && (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <div className="p-4 border-b border-zinc-800">
            <h4 className="font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              Matriz de Permissões por Cargo
            </h4>
            <p className="text-xs text-zinc-500 mt-1">
              Permissões padrão definidas para cada tipo de cargo
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-800/50">
                  <th className="text-left px-4 py-3 text-zinc-400 font-medium">
                    Permissão
                  </th>
                  <th className="text-center px-4 py-3 text-red-400 font-medium">
                    Admin
                  </th>
                  <th className="text-center px-4 py-3 text-purple-400 font-medium">
                    Gerente
                  </th>
                  <th className="text-center px-4 py-3 text-blue-400 font-medium">
                    Caixa
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(groupedPermissions).map(
                  ([category, permissions]) => (
                    <React.Fragment key={category}>
                      <tr className="bg-zinc-800/30">
                        <td
                          colSpan={4}
                          className="px-4 py-2 text-xs font-bold text-zinc-500 uppercase tracking-wider"
                        >
                          {category}
                        </td>
                      </tr>
                      {permissions.map(({ key, label }) => (
                        <tr
                          key={key}
                          className="border-t border-zinc-800/50 hover:bg-zinc-800/20"
                        >
                          <td className="px-4 py-2 text-zinc-300">{label}</td>
                          <td className="text-center px-4 py-2">
                            <Check className="w-4 h-4 text-green-500 mx-auto" />
                          </td>
                          <td className="text-center px-4 py-2">
                            {hasRolePermission("manager", key) ? (
                              <Check className="w-4 h-4 text-green-500 mx-auto" />
                            ) : (
                              <X className="w-4 h-4 text-zinc-600 mx-auto" />
                            )}
                          </td>
                          <td className="text-center px-4 py-2">
                            {hasRolePermission("cashier", key) ? (
                              <Check className="w-4 h-4 text-green-500 mx-auto" />
                            ) : (
                              <X className="w-4 h-4 text-zinc-600 mx-auto" />
                            )}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Form para adicionar */}
      {isAdding && canManageTeam && (
        <form
          onSubmit={handleAddMember}
          className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 space-y-4 animate-in slide-in-from-top-2"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Nome</label>
              <input
                type="text"
                value={newMember.name}
                onChange={(e) =>
                  setNewMember({ ...newMember, name: e.target.value })
                }
                className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-primary focus:border-primary"
                placeholder="Ex: João Silva"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Cargo</label>
              <select
                value={newMember.role}
                onChange={(e) =>
                  setNewMember({
                    ...newMember,
                    role: e.target.value as UserRole,
                  })
                }
                className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-primary focus:border-primary"
              >
                <option value="cashier">Caixa</option>
                <option value="manager">Gerente</option>
                <option value="admin">Administrador</option>
              </select>
              <p className="text-xs text-zinc-500 mt-1">
                {getRoleDescription(newMember.role)}
              </p>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">
                PIN (4 dígitos)
              </label>
              <input
                type="text"
                maxLength={4}
                value={newMember.pin}
                onChange={(e) => {
                  if (/^\d*$/.test(e.target.value))
                    setNewMember({ ...newMember, pin: e.target.value });
                }}
                className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-primary focus:border-primary"
                placeholder="0000"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-zinc-400 hover:text-white text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
            >
              Salvar Usuário
            </button>
          </div>
        </form>
      )}

      {/* Lista de membros */}
      <div className="grid gap-4">
        {members.map((member) => (
          <div
            key={member.id}
            className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 flex items-center justify-between group hover:border-zinc-700 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 border border-zinc-700">
                {member.role === "admin" ? (
                  <Shield className="w-5 h-5 text-red-400" />
                ) : member.role === "manager" ? (
                  <UserCog className="w-5 h-5 text-purple-400" />
                ) : (
                  <User className="w-5 h-5 text-blue-400" />
                )}
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">{member.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  {getRoleBadge(member.role)}
                  {editingId === member.id ? (
                    <input
                      type="text"
                      maxLength={4}
                      defaultValue=""
                      placeholder="Novo PIN"
                      className="w-20 bg-zinc-800 border border-zinc-600 rounded px-2 py-1 text-xs text-white"
                      onBlur={(e) => {
                        if (e.target.value)
                          handleUpdatePin(member.id, e.target.value);
                        else setEditingId(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter")
                          handleUpdatePin(
                            member.id,
                            (e.target as HTMLInputElement).value,
                          );
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      autoFocus
                    />
                  ) : (
                    <button
                      onClick={() => canManageTeam && setEditingId(member.id)}
                      className="text-xs text-zinc-500 flex items-center gap-1 hover:text-zinc-300"
                      title={canManageTeam ? "Clique para editar PIN" : "PIN"}
                    >
                      <KeyRound className="w-3 h-3" />
                      PIN: ****
                      {canManageTeam && (
                        <Edit className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {canManageTeam && (
              <button
                onClick={() => handleRemoveMember(member.id)}
                className="p-2 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                title="Remover Usuário"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SettingsTeam;
