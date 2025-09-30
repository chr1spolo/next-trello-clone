import React, { useState } from "react";
import { FaPlusCircle } from "react-icons/fa";
import { MdOutlineAlternateEmail } from "react-icons/md";

import { Member } from "@/types";
import MemberItem from "@/components/list-items/MemberItem";
import Input from "@/components/ui/Inputs/Default";
import Button from "@/components/ui/Buttons/Default";
import { isValidEmail } from "@/utils/email";
import { ROLES } from "@/utils/constants";

interface ListMembersProps {
  membersInvited: Member[] | [];
  onRemoveMember?: (memberId: string) => void;
  onAddMember?: (member: Member) => void;
}

const ListMembers = ({
  membersInvited,
  onRemoveMember,
  onAddMember,
}: ListMembersProps) => {
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] =
    useState<keyof typeof ROLES>("MEMBER");

  const handleAddMember = () => {
    if (!newMemberEmail) {
      return alert("El email no puede estar vacío");
    }

    if (!isValidEmail(newMemberEmail)) {
      return alert("El email no es válido");
    }

    setNewMemberEmail("");

    const newMember: Member = {
      userId: Date.now().toString(),
      user: {
        id: Date.now().toString(),
        email: newMemberEmail,
        name: newMemberEmail.split("@")[0],
        image: null,
        emailVerified: null,
      },
      role: newMemberRole,
    };

    onAddMember?.(newMember);
  };


  const handleRemoveMember = (member: Member) => {
    if (onRemoveMember) {
      console.log("Removing member with ID:", member.user.email);
      onRemoveMember(member.user.email!);
    }
  }

  return (
    <div className="w-full flex flex-col gap-2">
      <h3 className="text-[12px] font-semibold text-gray-500">Miembros</h3>
      <div className="max-h-40 overflow-y-auto flex py-2 flex-col gap-2">
        {membersInvited.length === 0 ? (
          <p className="text-sm text-gray-400 w-full text-center my-2">
            No hay miembros invitados
          </p>
        ) : (
          membersInvited.map((member) => (
            <MemberItem
              key={member.user.id}
              member={member}
              onRemoveMember={handleRemoveMember}
              onChangeRole={(m, newRole) => {
                if (onAddMember) {
                  onAddMember({ ...m, role: newRole });
                }
              }}
            />
          ))
        )}
      </div>
      <div className="w-full flex flex-row gap-2 border-t pt-2 border-gray-300">
        <div className="flex-grow flex basis-3/4">
          <Input
            placeholder="Invitar a un miembro"
            className="!shadow-none !outline-none !ring-0 w-full"
            value={newMemberEmail}
            onChange={(e) => setNewMemberEmail(e.target.value)}
            sizeIcon="sm"
            inputSize="sm"
            icon={MdOutlineAlternateEmail}
          />
        </div>
        <select
          name="role"
          id="role-user"
          className="bg-white text-gray-600 px-2 text-xs border border-gray-300 rounded-lg flex basis-[20%]"
          value={newMemberRole}
          onChange={(e) =>
            setNewMemberRole(e.target.value as "MEMBER" | "ADMIN")
          }
        >
          <option value="MEMBER">Miembro</option>
          <option value="ADMIN">Administrador</option>
        </select>

        <Button
          className="!p-0 !h-auto !w-[60px] !bg-transparent group transition-all flex basis-[5%]"
          onClick={handleAddMember}
        >
          <FaPlusCircle className="text-blue-500 w-5 h-5 group-hover:scale-[1.05] transition-transform" />
        </Button>
      </div>
    </div>
  );
};

export default ListMembers;
