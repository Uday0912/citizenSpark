const cron = require('node-cron');
const { fullDataSync } = require('./fetchData');

let cronJob = null;


const startCronJob = () => {
  const schedule = process.env.CRON_SCHEDULE || '0 2 * * *'; // Default: 2 AM daily
  
  console.log(`Setting up cron job with schedule: ${schedule}`);
  
  if (!cron.validate(schedule)) {
    console.error('Invalid cron schedule:', schedule);
    return;
  }
  
  cronJob = cron.schedule(schedule, async () => {
    console.log('🔄 Starting scheduled data synchronization...');
    
    try {
      const results = await fullDataSync();
      
      if (results.success) {
        console.log('✅ Scheduled sync completed successfully');
        console.log(`📊 Synced ${results.districts.syncedCount} districts and ${results.metrics.syncedCount} metrics in ${results.duration}`);
      } else {
        console.error('❌ Scheduled sync failed:', results.error);
      }
    } catch (error) {
      console.error('❌ Scheduled sync error:', error);
    }
  }, {
    scheduled: true,
    timezone: 'Asia/Kolkata' // Indian Standard Time
  });
  
  console.log('✅ Cron job started successfully');
};


const stopCronJob = () => {
  if (cronJob) {
    cronJob.stop();
    console.log('⏹️ Cron job stopped');
  }
};


const getCronStatus = () => {
  return {
    isRunning: cronJob ? cronJob.running : false,
    schedule: process.env.CRON_SCHEDULE || '0 2 * * *',
    timezone: 'Asia/Kolkata'
  };
};


const triggerManualSync = async () => {
  console.log('🔄 Manual data sync triggered...');
  
  try {
    const results = await fullDataSync();
    
    if (results.success) {
      console.log('✅ Manual sync completed successfully');
      return {
        success: true,
        message: 'Data synchronization completed',
        results
      };
    } else {
      console.error('❌ Manual sync failed:', results.error);
      return {
        success: false,
        error: results.error
      };
    }
  } catch (error) {
    console.error('❌ Manual sync error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  startCronJob,
  stopCronJob,
  getCronStatus,
  triggerManualSync
};
