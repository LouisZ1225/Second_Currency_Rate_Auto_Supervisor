import apscheduler.schedulers.blocking import BlockingScheduler
import logging

from Service.service_fetch import service_realtime

##在服务器上部署的模块

def start_scheduler():
    scheduler = BlockingScheduler()

    scheduler.add_job(
        service_realtime,
        trigger="cron",
        hour="*/4",
        minute=0,
        id="fetch_job",
        replace_existing=True
    )

    logging.info("Scheduler started...")

    scheduler.start()

if __name__ == "__main__":
    start_scheduler()