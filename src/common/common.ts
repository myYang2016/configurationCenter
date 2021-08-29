import ConfigDataForServer from '../schema/configForServer';
import ConfigDataForClient from '../schema/configForClient';

export function getKey(key: string) {
  return `config_polling_${key}`;
}

export async function getCurrentData(options: { type?: string, params: { [key: string]: any } }) {
  const { type = 'server', params } = options;
  const ConfigData = type === 'server' ? ConfigDataForServer : ConfigDataForClient;
  const currentData: any = await ConfigData.find(params);
  return currentData && currentData.length && currentData[0];
}
