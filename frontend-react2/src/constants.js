import { Activity, Microscope, Wind } from 'lucide-react';
import { T } from './theme';

export const DISEASES = {
  pneumonia:    { label: 'Neumonía',     color: T.primary, Icon: Wind },
  covid:        { label: 'COVID-19',     color: T.danger,  Icon: Activity },
  tuberculosis: { label: 'Tuberculosis', color: T.warn,    Icon: Microscope },
};
export const DISEASE_KEYS = Object.keys(DISEASES);

export const MODEL_NAMES = {
  densenet:  'DenseNet121',
  resnet:    'ResNet50',
  efficient: 'EfficientNet-B0',
};

export const ROLES = {
  admin:       { label: 'Admin',     color: '#6d28d9', bg: '#ede9fe' },
  radiologist: { label: 'Radiólogo', color: T.primary, bg: T.primaryLt },
  user:        { label: 'Médico',    color: T.success, bg: T.successLt },
};
export const canValidate = (user) => user?.role === 'admin' || user?.role === 'radiologist';

export const DATASETS = [
  { name: 'Chest X-Ray Images (Pneumonia)', note: 'Kermany et al., niños de 1 a 5 años · CC BY 4.0',
    href: 'https://www.kaggle.com/datasets/paultimothymooney/chest-xray-pneumonia' },
  { name: 'COVID-19 Radiography Database', note: 'Chowdhury, Rahman et al., IEEE Access 2020',
    href: 'https://www.kaggle.com/datasets/tawsifurrahman/covid19-radiography-database' },
  { name: 'Tuberculosis (TB) Chest X-ray Database', note: 'Rahman et al., IEEE Access 2020',
    href: 'https://www.kaggle.com/datasets/tawsifurrahman/tuberculosis-tb-chest-xray-dataset' },
];

export const SAMPLES = [1, 2, 3].map(n => `${process.env.PUBLIC_URL}/samples/ejemplo-${n}.jpg`);

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

// Cuenta de demostración opcional (definir en .env; ver README del frontend)
export const DEMO_CREDENTIALS =
  process.env.REACT_APP_DEMO_EMAIL && process.env.REACT_APP_DEMO_PASSWORD
    ? { email: process.env.REACT_APP_DEMO_EMAIL, password: process.env.REACT_APP_DEMO_PASSWORD }
    : null;
