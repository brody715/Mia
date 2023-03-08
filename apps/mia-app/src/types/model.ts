// This file contains all the types that are used in the model

// Datetime is a timestamp string, in ISO format
export type DateTime = string

export function getNowTimestamp() {
  return new Date().toISOString()
}
