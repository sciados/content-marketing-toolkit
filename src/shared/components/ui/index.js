// src/components/ui/index.js - FIXED with correct Tabs import
import Alert from './Alert';
import Badge from './Badge';
import Button from './Button';
import Card from './Card';
import Input from './Input';
import Loader from './Loader';
import LoadingSpinner from './LoadingSpinner';
import Modal from './Modal';
import Select from './Select';
import Table from './Table';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from './Tabs'; // Fixed: Named imports instead of default
import Toast from './Toast';
import ErrorBoundary from './ErrorBoundary';
import UsageMeter from './UsageMeter';
import UpgradePrompt from './UpgradePrompt';
import SystemStatus from './SystemStatus';

export {
  Alert,
  Badge,
  Button,
  Card,
  Input,
  Loader,
  LoadingSpinner,
  Modal,
  Select,
  Table,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel, // Export all Tab components
  Toast,
  ErrorBoundary,
  UsageMeter,
  UpgradePrompt,
  SystemStatus
};