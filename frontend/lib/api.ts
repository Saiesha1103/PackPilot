const API_BASE_URL =
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