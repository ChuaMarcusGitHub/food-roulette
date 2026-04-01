import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getSupabase,
  isSupabaseConfigured,
  fetchLocations,
  addLocation,
  deleteLocation,
  fetchGroup,
  changeInviteCode,
  deleteGroup,
  setJoinLocked,
  transferCreator,
  claimCreator,
} from "@/lib/supabase";
import {
  fetchMembers,
  fetchSelf,
  joinGroupById,
  leaveGroup,
  removeMember,
  setMemberPassword,
} from "@/lib/supabase/members";
import { normalizeLocationUrlForDedup, getDeviceId, setStoredGroupId, generateUniqueInviteCode } from "@/lib/utils";
import { t } from "@translate";
import { useNotice } from "./use-notice";
import { PATHS } from "@/routes";
import { GroupTab, IGroup, IMemberPublic } from "../types";

export interface UseGroupRoomReturn {
  // state
  configured: boolean;
  group: IGroup | null;
  member: IMemberPublic | null;
  members: IMemberPublic[];
  locations: Location[];
  tab: GroupTab;
  setTab: (t: GroupTab) => void;
  fetched: boolean;
  busy: boolean;
  isCreator: boolean;
  inviteDraft: string;
  setInviteDraft: (s: string) => void;
  memberNameById: Record<string, string>;
  // notice
  notice: { text: string; isError: boolean } | null;
  showNotice: (text: string, isError?: boolean) => void;
  // actions
  handleJoinRoom: (name: string) => Promise<void>;
  handleAddPlace: (name: string, url: string) => Promise<void>;
  handleRemovePlace: (locationId: string) => Promise<void>;
  handleSaveInviteCode: (code: string) => Promise<void>;
  handleRandomInviteCode: () => Promise<void>;
  handleRemoveMember: (targetId: string) => Promise<void>;
  handleTransferCreator: (targetId: string) => Promise<void>;
  handleClaimCreator: () => Promise<void>;
  handleDeleteGroup: () => Promise<void>;
  handleLeaveGroup: () => void;
  handleSetMemberPassword: (pw: string) => Promise<void>;
  handleToggleJoinLocked: () => Promise<void>;
  reloadLocations: () => Promise<void>;
  reloadMembers: () => Promise<void>;
}

/** All data, subscriptions, and actions for a group room. */
export function useGroupRoom(groupId: string | undefined): UseGroupRoomReturn {
  const navigate = useNavigate();
  const supabase = getSupabase();
  const configured = isSupabaseConfigured();
  const { notice, showNotice } = useNotice();

  const [group, setGroup] = useState<IGroup | null>(null);
  const [member, setMember] = useState<IMemberPublic | null>(null);
  const [members, setMembers] = useState<IMemberPublic[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [tab, setTab] = useState<GroupTab>("roulette");
  const [inviteDraft, setInviteDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [fetched, setFetched] = useState(false);
  const leavingRef = useRef(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const isCreator =
    Boolean(group?.creator_member_id) &&
    member?.id === group?.creator_member_id;

  const memberNameById = useMemo(() => {
    const m: Record<string, string> = {};
    members.forEach((x) => {
      m[x.id] = x.display_name;
    });
    return m;
  }, [members]);

  // --- loaders ---
  const loadGroup = useCallback(async () => {
    if (!supabase || !groupId) return;
    const { data, error } = await fetchGroup(supabase, groupId);
    if (error) {
      showNotice(error, true);
      return;
    }
    setGroup(data);
  }, [supabase, groupId, showNotice]);

  const loadSelf = useCallback(async () => {
    if (!supabase || !groupId) return;
    const deviceId = getDeviceId();
    if (!deviceId) return;
    const { data, error } = await fetchSelf(supabase, groupId, deviceId);
    if (error) {
      showNotice(error, true);
      return;
    }
    setMember(data);
  }, [supabase, groupId, showNotice]);

  const reloadMembers = useCallback(async () => {
    if (!supabase || !groupId) return;
    const { data, error } = await fetchMembers(supabase, groupId);
    if (error) {
      showNotice(error, true);
      return;
    }
    setMembers(data);
  }, [supabase, groupId, showNotice]);

  const reloadLocations = useCallback(async () => {
    if (!supabase || !groupId) return;
    const { data, error } = await fetchLocations(supabase, groupId);
    if (error) {
      showNotice(error, true);
      return;
    }
    setLocations(data);
  }, [supabase, groupId, showNotice]);

  // --- initial fetch ---
  useEffect(() => {
    if (!hydrated || !configured || !supabase || !groupId) return undefined;
    let cancelled = false;
    (async () => {
      try {
        await loadGroup();
        if (cancelled) return;
        await loadSelf();
        if (cancelled) return;
        await reloadMembers();
        if (cancelled) return;
        await reloadLocations();
      } finally {
        if (!cancelled) setFetched(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    hydrated,
    configured,
    supabase,
    groupId,
    loadGroup,
    loadSelf,
    reloadMembers,
    reloadLocations,
  ]);

  // --- realtime: group-level changes ---
  useEffect(() => {
    if (!supabase || !groupId) return undefined;
    const ch = supabase
      .channel(`group-live-${groupId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "group_members",
          filter: `group_id=eq.${groupId}`,
        },
        () => {
          reloadMembers();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "locations",
          filter: `group_id=eq.${groupId}`,
        },
        () => {
          reloadLocations();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "groups",
          filter: `id=eq.${groupId}`,
        },
        () => {
          loadGroup();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "groups",
          filter: `id=eq.${groupId}`,
        },
        () => {
          setStoredGroupId(null);
          showNotice(t("group.group_deleted"), true);
          navigate(PATHS.HOME, { replace: true });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [
    supabase,
    groupId,
    reloadMembers,
    reloadLocations,
    loadGroup,
    navigate,
    showNotice,
    t,
  ]);

  // --- fallback: periodic refresh (in case realtime is misconfigured) ---
  useEffect(() => {
    if (!supabase || !groupId) return undefined;
    const id = window.setInterval(() => {
      void reloadMembers();
    }, 15000);
    return () => {
      window.clearInterval(id);
    };
  }, [supabase, groupId, reloadMembers]);

  // --- realtime: auto-switch to roulette tab on new run ---
  useEffect(() => {
    if (!supabase || !groupId || !member) return undefined;
    const ch = supabase
      .channel(`roulette-open-${groupId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "roulette_runs",
          filter: `group_id=eq.${groupId}`,
        },
        () => {
          setTab("roulette");
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [supabase, groupId, member]);

  // --- realtime: kicked detection ---
  useEffect(() => {
    if (!supabase || !member?.id) return undefined;
    const ch = supabase
      .channel(`self-member-${member.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "group_members",
          filter: `id=eq.${member.id}`,
        },
        (payload) => {
          const nextDeviceId =
            (payload.new as { device_id?: string } | null)?.device_id ?? null;
          const thisDeviceId = getDeviceId();
          // If this member row moved to another device, kick this tab out.
          if (nextDeviceId && thisDeviceId && nextDeviceId !== thisDeviceId) {
            setStoredGroupId(null);
            showNotice(t("group.session_moved"), true);
            navigate(PATHS.HOME, { replace: true });
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "group_members",
          filter: `id=eq.${member.id}`,
        },
        () => {
          if (leavingRef.current) return;
          setStoredGroupId(null);
          showNotice(t("group.kicked"), true);
          navigate(PATHS.HOME, { replace: true });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [supabase, member?.id, navigate, showNotice, t]);

  // sync invite draft
  useEffect(() => {
    if (group?.invite_code) setInviteDraft(group.invite_code);
  }, [group?.invite_code]);

  // --- actions ---
  const handleJoinRoom = useCallback(
    async (name: string) => {
      if (!supabase || !groupId) return;
      setBusy(true);
      try {
        const deviceId = getDeviceId();
        if (!deviceId) throw new Error(t("common.err_device_id"));
        const { data, error } = await joinGroupById(
          supabase,
          groupId,
          name,
          deviceId,
        );
        if (error) {
          if (/room_locked/i.test(error))
            showNotice(t("group.room_locked"), true);
          else if (/name_taken/i.test(error))
            showNotice(t("group.err_name_taken"), true);
          else if (/empty_name/i.test(error))
            showNotice(t("home.err_join_name"), true);
          else showNotice(error, true);
          return;
        }
        if (!data?.group_id) {
          showNotice(t("group.err_join"), true);
          return;
        }
        setStoredGroupId(groupId);
        await loadSelf();
        await reloadMembers();
        showNotice(t("group.welcome", { name }));
      } catch (err: unknown) {
        showNotice(
          err instanceof Error ? err.message : t("group.err_join"),
          true,
        );
      } finally {
        setBusy(false);
      }
    },
    [supabase, groupId, t, showNotice, loadSelf, reloadMembers],
  );

  const handleAddPlace = useCallback(
    async (name: string, url: string) => {
      if (!supabase || !groupId || !member?.id) {
        showNotice(t("group.join_hint"), true);
        return;
      }
      const normalized = normalizeLocationUrlForDedup(url);
      if (
        locations.some(
          (loc) => normalizeLocationUrlForDedup(loc.url) === normalized,
        )
      ) {
        showNotice(t("group.place_duplicate"), true);
        return;
      }

      const normalizedName = name.trim().toLowerCase().replace(/\s+/g, " ");
      const isGenericName =
        !normalizedName ||
        normalizedName === "google maps place" ||
        /^location\s*\(/i.test(name.trim());

      if (!isGenericName) {
        if (
          locations.some((loc) => {
            const ln =
              loc.name?.trim().toLowerCase().replace(/\s+/g, " ") ?? "";
            return ln && ln === normalizedName;
          })
        ) {
          showNotice(t("group.place_duplicate_name"), true);
          return;
        }
      }

      setBusy(true);
      try {
        const error = await addLocation(
          supabase,
          groupId,
          name,
          url,
          member.id,
        );
        if (error) throw new Error(error);
        await reloadLocations();
        showNotice(t("group.place_added"));
        setTab("places");
      } catch (err: unknown) {
        showNotice(
          err instanceof Error ? err.message : t("group.err_add_place"),
          true,
        );
      } finally {
        setBusy(false);
      }
    },
    [
      supabase,
      groupId,
      member?.id,
      locations,
      t,
      showNotice,
      reloadLocations,
      setTab,
    ],
  );

  const handleRemovePlace = useCallback(
    async (locationId: string) => {
      if (!supabase || !groupId || !member) return;
      const loc = locations.find((l) => l.id === locationId);
      if (!loc) return;
      if (!isCreator) {
        showNotice(t("group.err_remove_place_forbidden"), true);
        return;
      }
      setBusy(true);
      try {
        const error = await deleteLocation(supabase, locationId);
        if (error) {
          if (error === "no_rows_deleted") {
            throw new Error(t("group.err_remove_place_policy"));
          }
          throw new Error(error);
        }
        setLocations((prev) => prev.filter((l) => l.id !== locationId));
        await reloadLocations();
        showNotice(t("group.place_removed"));
      } catch (err: unknown) {
        showNotice(
          err instanceof Error ? err.message : t("group.err_remove_place"),
          true,
        );
      } finally {
        setBusy(false);
      }
    },
    [
      supabase,
      groupId,
      member,
      locations,
      isCreator,
      t,
      showNotice,
      reloadLocations,
    ],
  );

  const handleSaveInviteCode = useCallback(
    async (code: string) => {
      if (!supabase || !groupId || !member) return;
      setBusy(true);
      try {
        const { data, error } = await changeInviteCode(
          supabase,
          groupId,
          member.id,
          code,
        );
        if (error) throw new Error(error);
        if (data?.invite_code) {
          setGroup((g) => (g ? { ...g, invite_code: data.invite_code! } : g));
          setInviteDraft(data.invite_code);
        }
        showNotice(t("group.invite_updated"));
      } catch (err: unknown) {
        showNotice(
          err instanceof Error ? err.message : t("group.errInviteUpdate"),
          true,
        );
      } finally {
        setBusy(false);
      }
    },
    [supabase, groupId, member, t, showNotice],
  );

  const handleRandomInviteCode = useCallback(async () => {
    if (!supabase || !groupId || !member || !group) return;
    setBusy(true);
    try {
      const code = await generateUniqueInviteCode(supabase, {
        excludeGroupId: group.id,
      });
      const { data, error } = await changeInviteCode(
        supabase,
        groupId,
        member.id,
        code,
      );
      if (error) throw new Error(error);
      if (data?.invite_code) {
        setGroup((g) => (g ? { ...g, invite_code: data.invite_code! } : g));
        setInviteDraft(data.invite_code);
      }
      showNotice(`${t("group.new_invite")} ${data?.invite_code ?? code}`);
    } catch (err: unknown) {
      showNotice(
        err instanceof Error ? err.message : t("group.errRandomizeCode"),
        true,
      );
    } finally {
      setBusy(false);
    }
  }, [supabase, groupId, member, group, t, showNotice]);

  const handleRemoveMember = useCallback(
    async (targetId: string) => {
      if (!supabase || !groupId || !member) return;
      setBusy(true);
      try {
        const error = await removeMember(
          supabase,
          groupId,
          member.id,
          targetId,
        );
        if (error) throw new Error(error);
        await reloadMembers();
        showNotice(t("group.member_removed"));
      } catch (err: unknown) {
        showNotice(
          err instanceof Error ? err.message : t("group.errRemoveMember"),
          true,
        );
      } finally {
        setBusy(false);
      }
    },
    [supabase, groupId, member, t, showNotice, reloadMembers],
  );

  const handleDeleteGroup = useCallback(async () => {
    if (!supabase || !groupId || !member) return;
    setBusy(true);
    try {
      const error = await deleteGroup(supabase, groupId, member.id);
      if (error) throw new Error(error);
      setStoredGroupId(null);
      showNotice(t("group.group_deleted_local"));
      navigate(PATHS.HOME, { replace: true });
    } catch (err: unknown) {
      showNotice(
        err instanceof Error ? err.message : t("group.err_delete"),
        true,
      );
    } finally {
      setBusy(false);
    }
  }, [supabase, groupId, member, t, showNotice, navigate]);

  const handleTransferCreator = useCallback(
    async (targetId: string) => {
      if (!supabase || !groupId || !member?.id || !isCreator) return;
      setBusy(true);
      try {
        const { data, error } = await transferCreator(
          supabase,
          groupId,
          member.id,
          targetId,
        );
        if (error) throw new Error(error);
        const nextCreatorId = data?.creator_member_id ?? targetId;
        setGroup((g) => (g ? { ...g, creator_member_id: nextCreatorId } : g));
        await reloadMembers();
        showNotice(t("group.creator_transferred"));
      } catch (err: unknown) {
        showNotice(
          err instanceof Error ? err.message : t("group.err_transfer_creator"),
          true,
        );
      } finally {
        setBusy(false);
      }
    },
    [supabase, groupId, member?.id, isCreator, t, showNotice, reloadMembers],
  );

  const handleClaimCreator = useCallback(async () => {
    if (!supabase || !groupId || !member?.id) return;
    setBusy(true);
    try {
      const { data, error } = await claimCreator(supabase, groupId, member.id);
      if (error) throw new Error(error);
      const nextCreatorId = data?.creator_member_id ?? member.id;
      setGroup((g) => (g ? { ...g, creator_member_id: nextCreatorId } : g));
      showNotice(t("group.creator_claimed"));
    } catch (err: unknown) {
      showNotice(
        err instanceof Error ? err.message : t("group.err_claim_creator"),
        true,
      );
    } finally {
      setBusy(false);
    }
  }, [supabase, groupId, member?.id, t, showNotice]);

  const handleLeaveGroup = useCallback(() => {
    leavingRef.current = true;
    setStoredGroupId(null);

    if (!supabase || !groupId || !member?.id) {
      navigate(PATHS.HOME);
      return;
    }

    // Remove this device's member row.
    void leaveGroup(supabase, groupId, member.id)
      .catch(() => {
        // Even if the RPC fails, still leave the UI.
      })
      .finally(() => {
        navigate(PATHS.HOME);
      });
  }, [supabase, groupId, member?.id, navigate]);

  const handleSetMemberPassword = useCallback(
    async (pw: string) => {
      if (!supabase || !groupId || !member?.id) return;
      setBusy(true);
      try {
        const deviceId = getDeviceId();
        if (!deviceId) throw new Error(t("common.err_device_id"));
        const error = await setMemberPassword(supabase, groupId, deviceId, pw);
        if (error) throw new Error(error);
        await loadSelf();
        showNotice(t("group.member_password_updated"));
      } catch (err: unknown) {
        showNotice(
          err instanceof Error
            ? err.message
            : t("group.err_save_member_password"),
          true,
        );
      } finally {
        setBusy(false);
      }
    },
    [supabase, groupId, member?.id, t, showNotice, loadSelf],
  );

  const handleToggleJoinLocked = useCallback(async () => {
    if (!supabase || !groupId || !member || !isCreator) return;
    const next = !group?.join_locked;
    setBusy(true);
    try {
      const { data, error } = await setJoinLocked(
        supabase,
        groupId,
        member.id,
        next,
      );
      if (error) throw new Error(error);
      setGroup((g) =>
        g ? { ...g, join_locked: data?.join_locked ?? next } : g,
      );
      showNotice(t("group.join_locked_updated"));
    } catch (err: unknown) {
      showNotice(err instanceof Error ? err.message : "Error", true);
    } finally {
      setBusy(false);
    }
  }, [supabase, groupId, member, isCreator, group?.join_locked, t, showNotice]);

  return {
    configured,
    group,
    member,
    members,
    locations,
    tab,
    setTab,
    fetched,
    busy,
    isCreator,
    inviteDraft,
    setInviteDraft,
    memberNameById,
    notice,
    showNotice,
    handleJoinRoom,
    handleAddPlace,
    handleRemovePlace,
    handleSaveInviteCode,
    handleRandomInviteCode,
    handleRemoveMember,
    handleTransferCreator,
    handleClaimCreator,
    handleDeleteGroup,
    handleLeaveGroup,
    handleSetMemberPassword,
    handleToggleJoinLocked,
    reloadLocations,
    reloadMembers,
  };
}
