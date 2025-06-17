
'use client';

import React, { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";

export default function ClientOnlyToaster() {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return <Toaster />;
}
