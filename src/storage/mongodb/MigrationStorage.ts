import Constants from '../../utils/Constants';
import DatabaseUtils from './DatabaseUtils';
import Logging from '../../utils/Logging';
import { Migration } from '../../types/Migration';
import Utils from '../../utils/Utils';
import global from '../../types/GlobalType';

const MODULE_NAME = 'MigrationStorage';

export default class MigrationStorage {
  static async getMigrations(): Promise<Migration[]> {
    // Debug
    const uniqueTimerID = Logging.traceDatabaseRequestStart();
    const aggregation = [];
    // Handle the ID
    DatabaseUtils.pushRenameDatabaseID(aggregation);
    // Read DB
    const migrationsMDB = await global.database.getCollection<Migration>(Constants.DEFAULT_TENANT, 'migrations')
      .aggregate<Migration>(aggregation)
      .toArray();
    // Debug
    await Logging.traceDatabaseRequestEnd(Constants.DEFAULT_TENANT, MODULE_NAME, 'getMigrations', uniqueTimerID, migrationsMDB);
    return migrationsMDB;
  }

  static async saveMigration(migrationToSave: Migration): Promise<void> {
    // Debug
    const uniqueTimerID = Logging.traceDatabaseRequestStart();
    // Transfer
    const migrationMDB = {
      // FIXME: Use a hash like in other collections
      _id: `${migrationToSave.name}~${migrationToSave.version}`,
      timestamp: Utils.convertToDate(migrationToSave.timestamp),
      name: migrationToSave.name,
      version: migrationToSave.version,
      durationSecs: Utils.convertToFloat(migrationToSave.durationSecs)
    };
    // Create
    await global.database.getCollection<any>(Constants.DEFAULT_TENANT, 'migrations')
      .insertOne(migrationMDB);
    // Debug
    await Logging.traceDatabaseRequestEnd(Constants.DEFAULT_TENANT, MODULE_NAME, 'saveMigration', uniqueTimerID, migrationMDB);
  }
}
