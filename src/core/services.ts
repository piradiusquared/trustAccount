import { PropertyManagementApp } from "./propertyManagement";
import { store } from './store';

export const service = new PropertyManagementApp(store);