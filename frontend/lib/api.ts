export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";


/* ------------------------------- SENSOR TYPES ------------------------------- */

export type SensorReading = {
  sensor_id: number;
  value: number;
  id: number;
  timestamp: string;
};


/* ------------------------------- SENSOR APIs ------------------------------- */

export async function getLatestSensorReading(
  sensorId: number
): Promise<SensorReading> {
  const response = await fetch(
    `${API_BASE_URL}/sensors/${sensorId}/readings/latest`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch latest reading for sensor ${sensorId}`
    );
  }

  return response.json();
}


export async function getSensorReadings(
  sensorId: number
): Promise<SensorReading[]> {
  const response = await fetch(
    `${API_BASE_URL}/sensors/${sensorId}/readings`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch readings for sensor ${sensorId}`
    );
  }

  return response.json();
}


/* -------------------------------- OEE TYPES -------------------------------- */

export type OEEInput = {
  planned_production_time: number;
  run_time: number;
  ideal_cycle_time: number;
  total_units: number;
  good_units: number;
};


export type OEEResponse = {
  availability: number;
  performance: number;
  quality: number;
  oee: number;
};


export type OEEHistoryRecord = {
  id: number;
  availability: number;
  performance: number;
  quality: number;
  oee: number;
  timestamp: string;
};


/* --------------------------------- OEE APIs -------------------------------- */

export async function calculateOEE(
  data: OEEInput
): Promise<OEEResponse> {
  const response = await fetch(
    `${API_BASE_URL}/oee/calculate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to calculate OEE");
  }

  return response.json();
}


export async function getOEEHistory(
  limit: number = 20
): Promise<OEEHistoryRecord[]> {
  const response = await fetch(
    `${API_BASE_URL}/oee/history?limit=${limit}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch OEE history");
  }

  return response.json();
}
/* ---------------------------- DOWNTIME TYPES ---------------------------- */

export type DowntimeEvent = {
  id: number;
  machine_id: number;
  reason: string;
  start_time: string;
  end_time: string | null;
  duration_minutes: number | null;
};

export type DowntimeAnalytics = {
  total_events: number;
  total_downtime_minutes: number;
  average_downtime_minutes: number;
  top_reason: string | null;
};

export type DowntimeReasonAnalytics = {
  reason: string;
  event_count: number;
  total_downtime_minutes: number;
};


/* ----------------------------- DOWNTIME APIs ----------------------------- */

export async function getDowntimeEvents(): Promise<DowntimeEvent[]> {
  const response = await fetch(
    `${API_BASE_URL}/downtime/`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch downtime events"
    );
  }

  return response.json();
}


export async function getDowntimeAnalytics(): Promise<DowntimeAnalytics> {
  const response = await fetch(
    `${API_BASE_URL}/downtime/analytics`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch downtime analytics"
    );
  }

  return response.json();
}


export async function getDowntimeByReason(): Promise<
  DowntimeReasonAnalytics[]
> {
  const response = await fetch(
    `${API_BASE_URL}/downtime/analytics/by-reason`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch downtime reason analytics"
    );
  }

  return response.json();
}
export type DowntimeMachineAnalytics = {
  machine_id: number;
  machine_name: string;
  line: string;
  machine_status: string;
  event_count: number;
  total_downtime_minutes: number;
  active_stops: number;
};

export async function getDowntimeByMachine(): Promise<
  DowntimeMachineAnalytics[]
> {
  const response = await fetch(
    `${API_BASE_URL}/downtime/analytics/by-machine`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch machine downtime analytics"
    );
  }

  return response.json();
}
export type Changeover = {
  id: number;
  machine_id: number;
  from_product: string;
  to_product: string;
  start_time: string;
  end_time: string | null;
  duration_minutes: number | null;
};

export type ChangeoverAnalytics = {
  total_changeovers: number;
  average_duration_minutes: number;
  total_changeover_minutes: number;
};

export async function getChangeovers(): Promise<Changeover[]> {
  const response = await fetch(
    `${API_BASE_URL}/changeover`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch changeovers"
    );
  }

  return response.json();
}

export async function getChangeoverAnalytics(): Promise<ChangeoverAnalytics> {
  const response = await fetch(
    `${API_BASE_URL}/changeover/analytics`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch changeover analytics"
    );
  }

  return response.json();
}
export async function createChangeover(
  data: {
    machine_id: number;
    from_product: string;
    to_product: string;
  }
): Promise<Changeover> {
  const response = await fetch(
    `${API_BASE_URL}/changeover/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to create changeover"
    );
  }

  return response.json();
}
export async function closeChangeover(
  changeoverId: number
): Promise<Changeover> {
  const response = await fetch(
    `${API_BASE_URL}/changeover/${changeoverId}/close`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to close changeover");
  }

  return response.json();
}