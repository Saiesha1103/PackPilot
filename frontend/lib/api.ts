const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export type SensorReading = {
  sensor_id: number;
  value: number;
  id: number;
  timestamp: string;
};

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