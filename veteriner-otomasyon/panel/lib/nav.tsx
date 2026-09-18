"use client";

import { createContext, useContext } from "react";

export const GORUNUMLER = [
  "bugun", "cikis", "stok", "kacak", "miat", "mal-kabul", "hastalar", "takvim", "musteriler",
] as const;

export type Gorunum = (typeof GORUNUMLER)[number];

export const NavCtx = createContext<{ aktif: Gorunum; git: (g: Gorunum) => void }>({
  aktif: "bugun",
  git: () => {},
});

export const useNav = () => useContext(NavCtx);
