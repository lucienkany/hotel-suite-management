import { Injectable } from '@nestjs/common';

/**
 * Lookup Service for Hotel Management System
 * 
 * Since the new schema uses string enums instead of lookup tables,
 * this service provides validation and constants for those enums.
 */
@Injectable()
export class LookupService {
  // User Roles
  private readonly USER_ROLES = [
    'ADMIN',
    'MANAGER',
    'RECEPTIONIST',
    'STAFF',
    'CASHIER',
  ] as const;

  // User Statuses
  private readonly USER_STATUSES = [
    'active',
    'inactive',
    'suspended',
  ] as const;

  // Room Types
  private readonly ROOM_TYPES = [
    'SINGLE',
    'DOUBLE',
    'SUITE',
    'DELUXE',
    'PRESIDENTIAL',
  ] as const;

  // Room Statuses
  private readonly ROOM_STATUSES = [
    'AVAILABLE',
    'OCCUPIED',
    'MAINTENANCE',
    'CLEANING',
    'RESERVED',
  ] as const;

  // Stay/Booking Statuses
  private readonly STAY_STATUSES = [
    'confirmed',
    'checked-in',
    'checked-out',
    'cancelled',
    'no-show',
  ] as const;

  // Invoice Statuses
  private readonly INVOICE_STATUSES = [
    'pending',
    'completed',
    'cancelled',
    'refunded',
  ] as const;

  // Payment Methods
  private readonly PAYMENT_METHODS = [
    'CASH',
    'CARD',
    'MOBILE_MONEY',
    'BANK_TRANSFER',
    'CREDIT',
  ] as const;

  // Invoice Types (for Restaurant)
  private readonly INVOICE_TYPES = [
    'STAY',
    'WALKIN',
  ] as const;

  // License Plans
  private readonly LICENSE_PLANS = [
    'TRIAL',
    'BASIC',
    'PREMIUM',
    'ENTERPRISE',
  ] as const;

  // License Statuses
  private readonly LICENSE_STATUSES = [
    'ACTIVE',
    'EXPIRED',
    'SUSPENDED',
  ] as const;

  // Audit Actions
  private readonly AUDIT_ACTIONS = [
    'CREATE',
    'UPDATE',
    'DELETE',
    'RESTORE',
  ] as const;

  /**
   * Validate if a value is a valid user role
   */
  isValidUserRole(role: string): boolean {
    return this.USER_ROLES.includes(role as any);
  }

  /**
   * Validate if a value is a valid user status
   */
  isValidUserStatus(status: string): boolean {
    return this.USER_STATUSES.includes(status as any);
  }

  /**
   * Validate if a value is a valid room type
   */
  isValidRoomType(type: string): boolean {
    return this.ROOM_TYPES.includes(type as any);
  }

  /**
   * Validate if a value is a valid room status
   */
  isValidRoomStatus(status: string): boolean {
    return this.ROOM_STATUSES.includes(status as any);
  }

  /**
   * Validate if a value is a valid stay status
   */
  isValidStayStatus(status: string): boolean {
    return this.STAY_STATUSES.includes(status as any);
  }

  /**
   * Validate if a value is a valid invoice status
   */
  isValidInvoiceStatus(status: string): boolean {
    return this.INVOICE_STATUSES.includes(status as any);
  }

  /**
   * Validate if a value is a valid payment method
   */
  isValidPaymentMethod(method: string): boolean {
    return this.PAYMENT_METHODS.includes(method as any);
  }

  /**
   * Validate if a value is a valid invoice type
   */
  isValidInvoiceType(type: string): boolean {
    return this.INVOICE_TYPES.includes(type as any);
  }

  /**
   * Validate if a value is a valid license plan
   */
  isValidLicensePlan(plan: string): boolean {
    return this.LICENSE_PLANS.includes(plan as any);
  }

  /**
   * Validate if a value is a valid license status
   */
  isValidLicenseStatus(status: string): boolean {
    return this.LICENSE_STATUSES.includes(status as any);
  }

  /**
   * Validate if a value is a valid audit action
   */
  isValidAuditAction(action: string): boolean {
    return this.AUDIT_ACTIONS.includes(action as any);
  }

  /**
   * Get all valid user roles
   */
  getUserRoles(): readonly string[] {
    return this.USER_ROLES;
  }

  /**
   * Get all valid user statuses
   */
  getUserStatuses(): readonly string[] {
    return this.USER_STATUSES;
  }

  /**
   * Get all valid room types
   */
  getRoomTypes(): readonly string[] {
    return this.ROOM_TYPES;
  }

  /**
   * Get all valid room statuses
   */
  getRoomStatuses(): readonly string[] {
    return this.ROOM_STATUSES;
  }

  /**
   * Get all valid stay statuses
   */
  getStayStatuses(): readonly string[] {
    return this.STAY_STATUSES;
  }

  /**
   * Get all valid invoice statuses
   */
  getInvoiceStatuses(): readonly string[] {
    return this.INVOICE_STATUSES;
  }

  /**
   * Get all valid payment methods
   */
  getPaymentMethods(): readonly string[] {
    return this.PAYMENT_METHODS;
  }

  /**
   * Get all valid invoice types
   */
  getInvoiceTypes(): readonly string[] {
    return this.INVOICE_TYPES;
  }

  /**
   * Get all valid license plans
   */
  getLicensePlans(): readonly string[] {
    return this.LICENSE_PLANS;
  }

  /**
   * Get all valid license statuses
   */
  getLicenseStatuses(): readonly string[] {
    return this.LICENSE_STATUSES;
  }

  /**
   * Get all valid audit actions
   */
  getAuditActions(): readonly string[] {
    return this.AUDIT_ACTIONS;
  }

  /**
   * Validate and normalize user role (throws if invalid)
   */
  validateUserRole(role: string): string {
    const normalized = role.toUpperCase();
    if (!this.isValidUserRole(normalized)) {
      throw new Error(
        `Invalid user role: ${role}. Valid roles: ${this.USER_ROLES.join(', ')}`,
      );
    }
    return normalized;
  }

  /**
   * Validate and normalize user status (throws if invalid)
   */
  validateUserStatus(status: string): string {
    const normalized = status.toLowerCase();
    if (!this.isValidUserStatus(normalized)) {
      throw new Error(
        `Invalid user status: ${status}. Valid statuses: ${this.USER_STATUSES.join(', ')}`,
      );
    }
    return normalized;
  }

  /**
   * Validate and normalize room type (throws if invalid)
   */
  validateRoomType(type: string): string {
    const normalized = type.toUpperCase();
    if (!this.isValidRoomType(normalized)) {
      throw new Error(
        `Invalid room type: ${type}. Valid types: ${this.ROOM_TYPES.join(', ')}`,
      );
    }
    return normalized;
  }

  /**
   * Validate and normalize room status (throws if invalid)
   */
  validateRoomStatus(status: string): string {
    const normalized = status.toUpperCase();
    if (!this.isValidRoomStatus(normalized)) {
      throw new Error(
        `Invalid room status: ${status}. Valid statuses: ${this.ROOM_STATUSES.join(', ')}`,
      );
    }
    return normalized;
  }

  /**
   * Validate and normalize stay status (throws if invalid)
   */
  validateStayStatus(status: string): string {
    const normalized = status.toLowerCase();
    if (!this.isValidStayStatus(normalized)) {
      throw new Error(
        `Invalid stay status: ${status}. Valid statuses: ${this.STAY_STATUSES.join(', ')}`,
      );
    }
    return normalized;
  }

  /**
   * Validate and normalize invoice status (throws if invalid)
   */
  validateInvoiceStatus(status: string): string {
    const normalized = status.toLowerCase();
    if (!this.isValidInvoiceStatus(normalized)) {
      throw new Error(
        `Invalid invoice status: ${status}. Valid statuses: ${this.INVOICE_STATUSES.join(', ')}`,
      );
    }
    return normalized;
  }

  /**
   * Validate and normalize payment method (throws if invalid)
   */
  validatePaymentMethod(method: string): string {
    const normalized = method.toUpperCase();
    if (!this.isValidPaymentMethod(normalized)) {
      throw new Error(
        `Invalid payment method: ${method}. Valid methods: ${this.PAYMENT_METHODS.join(', ')}`,
      );
    }
    return normalized;
  }

  /**
   * Get default values for common fields
   */
  getDefaults() {
    return {
      userStatus: 'active' as const,
      userRole: 'STAFF' as const,
      roomStatus: 'AVAILABLE' as const,
      stayStatus: 'confirmed' as const,
      invoiceStatus: 'pending' as const,
      licensePlan: 'TRIAL' as const,
      licenseStatus: 'ACTIVE' as const,
    };
  }
}

