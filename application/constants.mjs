export const schema = {
  type: 'object',
  required: [
    'DB_HOST',
    'DB_PORT',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME',
    'APP_HOST',
    'APP_PORT',
  ],
  properties: {
    DB_HOST: {
      type: 'string',
      default: 'localhost'
    },
    DB_PORT: {
      type: 'string',
      default: '5432'
    },
    DB_USER: {
      type: 'string',
      default: 'postgres'
    },
    DB_PASSWORD: {
      type: 'string',
      default: 'postgres'
    },
    DB_NAME: {
      type: 'string',
      default: 'smart_home'
    },
    APP_PORT: {
      type: 'string',
      default: '3000'
    },
    APP_HOST: {
      type: 'string',
      default: 'localhost'
    },
    MQTT_HOST: {
      type: 'string',
      default: '192.168.1.191'
    },
    MQTT_PORT: {
      type: 'string',
      default: '1883'
    },
  }
}