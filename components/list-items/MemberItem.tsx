"use client";

import Image from "next/image";
import React from "react";
import { RiCloseCircleLine } from "react-icons/ri";

import { Member } from "@/types";
import { ROLES } from "@/utils/constants";

interface MemberItemProps {
  member: Member;
  onRemoveMember?: (member: Member) => void;
  onChangeRole?: (member: Member, newRole: keyof typeof ROLES) => void;
}

const MemberItem = ({
  member,
  onRemoveMember,
  onChangeRole,
}: MemberItemProps) => {
  return (
    <div className="flex items-center gap-2 flex-row px-2 justify-between">
      <div className="flex items-center gap-2 flex-row">
        <div className="flex-shrink-0">
          {member.user.image ? (
            <Image
              src={member.user.image}
              alt={member.user.name || "User Avatar"}
              className="w-6 h-6 rounded-full"
              width={24}
              height={24}
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs text-white">
              {member.user.name
                ? member.user.name.charAt(0).toUpperCase()
                : "@"}
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-700">
            {member.user.name || member.user.email}
            {member.role === "ADMIN" ||
              (member.role === "OWNER" && (
                <span className="text-[10px] text-blue-500 font-bold ml-1">
                  (Admin &#9733;)
                </span>
              ))}
          </span>
          {member.role && (
            <span className="text-[10px] text-gray-400 font-bold italic">
              {member.user.email}
            </span>
          )}
        </div>
      </div>
      <div className="flex-grow flex justify-end gap-2">
        <select
          name="role"
          id=""
          className="bg-white text-gray-600 p-2 text-xs border-b border-gray-300 rounded-lg"
          value={member.role}
          disabled={member.role === "OWNER"}
          onChange={(e) =>
            onChangeRole?.(member, e.target.value as keyof typeof ROLES)
          }
        >
          {member.role === "OWNER" ? (
            <option value="OWNER">Propietario</option>
          ) : null}
          <option value="MEMBER">Miembro</option>
          <option value="ADMIN">Administrador</option>
        </select>
        <div className="flex justify-end">
          {member.role !== "OWNER" ? (
            <button
              className="text-red-500 hover:text-red-700"
              onClick={() => onRemoveMember?.(member)}
            >
              <RiCloseCircleLine className="w-5 h-5" />
            </button>
          ) : (
            <span className=" w-5 h-5" />
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberItem;
