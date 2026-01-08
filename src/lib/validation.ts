import { getUserRole } from './user-roles';

export async function validateSeatUpdate(
  userId: string, 
  updates: Record<string, any>
): Promise<{ valid: boolean; error?: string }> {
  try {
    const userRole = await getUserRole(userId);
    
    // Check if trying to update status
    const statusUpdates = Object.keys(updates).filter(key => key.includes('/status'));
    const maintenanceUpdates = Object.keys(updates).filter(key => key.includes('maintenanceInfo'));
    
    for (const key of statusUpdates) {
      const status = updates[key];
      
      // Users can only set: available, reserved, occupied
      if (userRole !== 'admin' && !['available', 'reserved', 'occupied'].includes(status)) {
        return {
          valid: false,
          error: `Users cannot set seat status to '${status}'. Only admin can set maintenance/out-of-service.`
        };
      }
    }
    
    // Check maintenance info updates
    if (maintenanceUpdates.length > 0 && userRole !== 'admin') {
      return {
        valid: false,
        error: 'Only admin can update maintenance information.'
      };
    }
    
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: 'Failed to validate permissions.'
    };
  }
}

export async function validateBookingAction(
  userId: string,
  action: 'create' | 'cancel' | 'extend',
  targetUserId?: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    const userRole = await getUserRole(userId);
    
    // Users can only manage their own bookings
    if (userRole !== 'admin' && targetUserId && targetUserId !== userId) {
      return {
        valid: false,
        error: 'You can only manage your own bookings.'
      };
    }
    
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: 'Failed to validate booking permissions.'
    };
  }
}