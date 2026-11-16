<template>
  <q-page class="dashboard-page">
    <!-- =====================================================
         WELCOME BANNER
    ====================================================== -->
    <section class="welcome-banner">
      <div class="welcome-content">
        <div class="welcome-label">
          <span class="welcome-dot"></span>
          Welcome back!
        </div>

        <h1>
          {{ userName }}
          <span class="wave">👋</span>
        </h1>
      </div>

      <div class="welcome-city-hall">
        <img
          src="/image/AnimatedCityHall.png"
          alt="City Hall of Tagum"
          loading="lazy"
        />
      </div>
    </section>

    <!-- =====================================================
         STATISTICS
    ====================================================== -->
    <section class="statistics-grid">
      <!-- Total Recognitions -->
      <q-card flat class="stat-card">
        <div class="stat-icon stat-icon-gold">
          <q-icon name="star" size="26px" />
        </div>

        <div class="stat-content">
          <div class="stat-label">Total Recognitions</div>

          <div class="stat-value">1,284</div>

          <div class="stat-change stat-change-gold">
            <q-icon name="arrow_upward" size="13px" />
            +156 this month
          </div>
        </div>

        <div class="stat-arrow stat-arrow-gold">
          <q-icon name="north_east" size="17px" />
        </div>
      </q-card>

      <!-- Awards Given -->
      <q-card flat class="stat-card">
        <div class="stat-icon stat-icon-orange">
          <q-icon name="emoji_events" size="26px" />
        </div>

        <div class="stat-content">
          <div class="stat-label">Awards Given</div>

          <div class="stat-value">342</div>

          <div class="stat-change stat-change-orange">
            <q-icon name="arrow_upward" size="13px" />
            +28 this month
          </div>
        </div>

        <div class="stat-arrow stat-arrow-orange">
          <q-icon name="north_east" size="17px" />
        </div>
      </q-card>

      <!-- Points Earned -->
      <q-card flat class="stat-card">
        <div class="stat-icon stat-icon-yellow">
          <q-icon name="stars" size="26px" />
        </div>

        <div class="stat-content">
          <div class="stat-label">Points Earned</div>

          <div class="stat-value">8,956</div>

          <div class="stat-change stat-change-yellow">
            <q-icon name="arrow_upward" size="13px" />
            +1,245 this month
          </div>
        </div>

        <div class="stat-arrow stat-arrow-yellow">
          <q-icon name="north_east" size="17px" />
        </div>
      </q-card>

      <!-- Certificates Issued -->
      <q-card flat class="stat-card">
        <div class="stat-icon stat-icon-green">
          <q-icon name="card_membership" size="26px" />
        </div>

        <div class="stat-content">
          <div class="stat-label">Certificates Issued</div>

          <div class="stat-value">527</div>

          <div class="stat-change stat-change-green">
            <q-icon name="arrow_upward" size="13px" />
            +42 this month
          </div>
        </div>

        <div class="stat-arrow stat-arrow-green">
          <q-icon name="north_east" size="17px" />
        </div>
      </q-card>
    </section>

    <!-- =====================================================
         MAIN CONTENT
    ====================================================== -->
    <section class="dashboard-grid">
      <!-- ===================================================
           LEFT COLUMN
      ==================================================== -->
      <div class="dashboard-left">
        <!-- Recent Recognitions -->
        <q-card flat class="dashboard-card">
          <div class="card-header">
            <div class="card-title-wrapper">
              <div class="card-icon gold">
                <q-icon name="star" size="19px" />
              </div>

              <h2>Recent Recognitions</h2>
            </div>

            <q-btn
              flat
              no-caps
              class="view-all-btn"
              label="View All"
              icon-right="chevron_right"
            />
          </div>

          <div class="events-list">
            <!-- Recognition 1 -->
            <div class="event-item">
              <div class="event-date">
                <div class="event-month">AUG</div>

                <div class="event-day">25</div>
              </div>

              <div class="event-details">
                <div class="event-title">Employee of the Month</div>

                <div class="event-meta">
                  <span>
                    <q-icon name="person" />
                    Maria Santos
                  </span>

                  <span>
                    <q-icon name="business" />
                    HR Department
                  </span>
                </div>
              </div>

              <q-badge class="event-status status-approved" label="Approved" />
            </div>

            <!-- Recognition 2 -->
            <div class="event-item">
              <div class="event-date">
                <div class="event-month">AUG</div>

                <div class="event-day">22</div>
              </div>

              <div class="event-details">
                <div class="event-title">Outstanding Team Performance</div>

                <div class="event-meta">
                  <span>
                    <q-icon name="person" />
                    Juan Dela Cruz
                  </span>

                  <span>
                    <q-icon name="business" />
                    IT Department
                  </span>
                </div>
              </div>

              <q-badge class="event-status status-pending" label="Pending" />
            </div>

            <!-- Recognition 3 -->
            <div class="event-item">
              <div class="event-date">
                <div class="event-month">AUG</div>

                <div class="event-day">20</div>
              </div>

              <div class="event-details">
                <div class="event-title">Leadership Excellence Award</div>

                <div class="event-meta">
                  <span>
                    <q-icon name="person" />
                    Ana Reyes
                  </span>

                  <span>
                    <q-icon name="business" />
                    Finance Department
                  </span>
                </div>
              </div>

              <q-badge class="event-status status-approved" label="Approved" />
            </div>

            <!-- Recognition 4 -->
            <div class="event-item">
              <div class="event-date">
                <div class="event-month">AUG</div>

                <div class="event-day">18</div>
              </div>

              <div class="event-details">
                <div class="event-title">Innovation Award</div>

                <div class="event-meta">
                  <span>
                    <q-icon name="person" />
                    Carlo Mendoza
                  </span>

                  <span>
                    <q-icon name="business" />
                    Operations Department
                  </span>
                </div>
              </div>

              <q-badge class="event-status status-pending" label="Pending" />
            </div>
          </div>
        </q-card>
      </div>

      <!-- ===================================================
           RIGHT COLUMN
      ==================================================== -->
      <div class="dashboard-right">
        <!-- Calendar -->
        <q-card flat class="dashboard-card calendar-card">
          <div class="card-header">
            <div class="card-title-wrapper">
              <div class="card-icon gold">
                <q-icon name="calendar_month" size="19px" />
              </div>

              <h2>Calendar</h2>
            </div>

            <div class="calendar-controls">
              <q-btn flat round dense icon="chevron_left" size="sm" />

              <strong> August 2026 </strong>

              <q-btn flat round dense icon="chevron_right" size="sm" />

              <q-btn outline no-caps dense label="Today" class="today-btn" />
            </div>
          </div>

          <div class="calendar">
            <div class="calendar-weekdays">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            <div class="calendar-days">
              <!-- Previous month -->
              <div class="calendar-day muted">26</div>
              <div class="calendar-day muted">27</div>
              <div class="calendar-day muted">28</div>
              <div class="calendar-day muted">29</div>
              <div class="calendar-day muted">30</div>
              <div class="calendar-day muted">31</div>

              <div class="calendar-day">
                1
                <span class="calendar-dot gold-dot"></span>
              </div>

              <div class="calendar-day">2</div>

              <div class="calendar-day">
                3
                <span class="calendar-dot gold-dot"></span>
              </div>

              <div class="calendar-day">4</div>
              <div class="calendar-day">5</div>
              <div class="calendar-day">6</div>
              <div class="calendar-day">7</div>
              <div class="calendar-day">8</div>
              <div class="calendar-day">9</div>

              <div class="calendar-day">
                10
                <span class="calendar-dot orange-dot"></span>
              </div>

              <div class="calendar-day">
                11
                <span class="calendar-dot green-dot"></span>
              </div>

              <div class="calendar-day">
                12
                <span class="calendar-dot yellow-dot"></span>
              </div>

              <div class="calendar-day">13</div>

              <div class="calendar-day">
                14
                <span class="calendar-dot orange-dot"></span>
              </div>

              <div class="calendar-day">15</div>
              <div class="calendar-day">16</div>
              <div class="calendar-day">17</div>
              <div class="calendar-day">18</div>
              <div class="calendar-day">19</div>
              <div class="calendar-day">20</div>
              <div class="calendar-day">21</div>
              <div class="calendar-day">22</div>
              <div class="calendar-day">23</div>
              <div class="calendar-day">24</div>

              <div class="calendar-day today">25</div>

              <div class="calendar-day">26</div>

              <div class="calendar-day">
                27
                <span class="calendar-dot green-dot"></span>
              </div>

              <div class="calendar-day">
                28
                <span class="calendar-dot yellow-dot"></span>
              </div>

              <div class="calendar-day">29</div>
              <div class="calendar-day">30</div>
              <div class="calendar-day">31</div>

              <!-- September -->
              <div class="calendar-day muted">1</div>
              <div class="calendar-day muted">2</div>
              <div class="calendar-day muted">3</div>
              <div class="calendar-day muted">4</div>
              <div class="calendar-day muted">5</div>
            </div>
          </div>
        </q-card>
      </div>
    </section>

    <!-- =====================================================
         BOTTOM SECTION
    ====================================================== -->
    <section class="bottom-grid">
      <!-- Top Performers -->
      <q-card flat class="dashboard-card performers-card">
        <div class="card-header">
          <div class="card-title-wrapper">
            <div class="card-icon gold">
              <q-icon name="leaderboard" size="19px" />
            </div>

            <h2>Top Performers</h2>
          </div>

          <q-btn
            flat
            no-caps
            class="view-all-btn"
            label="View All"
            icon-right="chevron_right"
          />
        </div>

        <div class="performers-list">
          <div class="performer-item">
            <div class="performer-rank">1</div>
            <q-avatar class="performer-avatar" color="gold"> MS </q-avatar>
            <div class="performer-info">
              <div class="performer-name">Maria Santos</div>
              <div class="performer-dept">HR Department</div>
            </div>
            <div class="performer-points">
              <q-icon name="stars" size="14px" class="star-icon" />
              2,450 pts
            </div>
          </div>

          <div class="performer-item">
            <div class="performer-rank">2</div>
            <q-avatar class="performer-avatar" color="silver"> JD </q-avatar>
            <div class="performer-info">
              <div class="performer-name">Juan Dela Cruz</div>
              <div class="performer-dept">IT Department</div>
            </div>
            <div class="performer-points">
              <q-icon name="stars" size="14px" class="star-icon" />
              1,890 pts
            </div>
          </div>

          <div class="performer-item">
            <div class="performer-rank">3</div>
            <q-avatar class="performer-avatar" color="bronze"> AR </q-avatar>
            <div class="performer-info">
              <div class="performer-name">Ana Reyes</div>
              <div class="performer-dept">Finance Department</div>
            </div>
            <div class="performer-points">
              <q-icon name="stars" size="14px" class="star-icon" />
              1,675 pts
            </div>
          </div>
        </div>
      </q-card>

      <!-- Quick Actions -->
      <q-card flat class="dashboard-card actions-card">
        <div class="card-header">
          <div class="card-title-wrapper">
            <div class="card-icon gold">
              <q-icon name="bolt" size="19px" />
            </div>

            <h2>Quick Actions</h2>
          </div>
        </div>

        <div class="actions-grid">
          <div class="action-item">
            <div class="action-icon gold">
              <q-icon name="how_to_vote" size="24px" />
            </div>
            <span class="action-label">Nominate</span>
          </div>

          <div class="action-item">
            <div class="action-icon orange">
              <q-icon name="emoji_events" size="24px" />
            </div>
            <span class="action-label">Give Award</span>
          </div>

          <div class="action-item">
            <div class="action-icon yellow">
              <q-icon name="stars" size="24px" />
            </div>
            <span class="action-label">Award Points</span>
          </div>

          <div class="action-item">
            <div class="action-icon green">
              <q-icon name="card_membership" size="24px" />
            </div>
            <span class="action-label">Issue Certificate</span>
          </div>
        </div>
      </q-card>
    </section>
  </q-page>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from "vue";

// Default user data (fallback if no user in session)
const DEFAULT_USER = {
  username: "user",
  fullName: "Guest User",
  role: "employee",
  office: "No Office Assigned",
};

export default defineComponent({
  name: "DashboardPage",

  setup() {
    // Get user data from sessionStorage
    const getUserData = () => {
      const stored = sessionStorage.getItem("user");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return DEFAULT_USER;
        }
      }
      return DEFAULT_USER;
    };

    const userData = ref(getUserData());

    const userName = computed(() => userData.value.fullName || "Guest");

    // Listen for storage changes (if user updates in another tab)
    onMounted(() => {
      window.addEventListener("storage", (event) => {
        if (event.key === "user") {
          if (event.newValue) {
            try {
              userData.value = JSON.parse(event.newValue);
            } catch {
              userData.value = DEFAULT_USER;
            }
          } else {
            userData.value = DEFAULT_USER;
          }
        }
      });
    });

    return {
      userName,
    };
  },
});
</script>

<style scoped>
/* =========================================================
   PAGE
========================================================= */

.dashboard-page {
  padding: 18px 20px 12px;

  background: radial-gradient(
      circle at 100% 0%,
      rgba(245, 166, 35, 0.07),
      transparent 28%
    ),
    #f8f9fa;

  color: #f0efef;
}

/* =========================================================
   WELCOME BANNER
========================================================= */

.welcome-banner {
  position: relative;

  min-height: 155px;

  overflow: hidden;

  display: flex;

  align-items: center;

  padding: 28px 38px;

  border-radius: 14px;

  background: linear-gradient(110deg, #fef3e0 0%, #fde8cc 48%, #f5a623 100%);

  box-shadow: 0 4px 14px rgba(232, 145, 26, 0.08);
}

.welcome-banner::after {
  content: "";

  position: absolute;

  width: 420px;
  height: 420px;

  right: 120px;
  top: -260px;

  border-radius: 50%;

  border: 80px solid rgba(255, 255, 255, 0.16);
}

.welcome-content {
  position: relative;

  z-index: 2;
}

.welcome-label {
  display: flex;

  align-items: center;

  gap: 9px;

  color: #b87a0c;

  font-size: 14px;
}

.welcome-dot {
  width: 10px;
  height: 10px;

  border-radius: 50%;

  background: #f5a623;
}

.welcome-content h1 {
  margin: 4px 0 4px;

  font-size: 31px;

  line-height: 1.1;

  font-weight: 750;

  color: #102c40;
}

.wave {
  font-size: 26px;
}

.welcome-content p {
  margin: 0;

  color: #55717c;

  font-size: 13px;
}

.welcome-city-hall {
  position: absolute;

  right: 15px;
  bottom: -8px;

  width: 250px;

  z-index: 1;
}

.welcome-city-hall img {
  width: 100%;

  display: block;
}

/* =========================================================
   STATISTICS
========================================================= */

.statistics-grid {
  display: grid;

  grid-template-columns: repeat(4, 1fr);

  gap: 16px;

  margin-top: 18px;
}

.stat-card {
  position: relative;

  min-height: 116px;

  display: flex;

  align-items: center;

  padding: 18px;

  border-radius: 13px;

  background: #ffffff;

  box-shadow: 0 3px 12px rgba(30, 70, 42, 0.055);

  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);

  box-shadow: 0 7px 18px rgba(30, 70, 42, 0.09);
}

.stat-icon {
  width: 62px;
  height: 62px;

  min-width: 62px;

  display: flex;

  align-items: center;
  justify-content: center;

  border-radius: 13px;

  color: #ffffff;
}

.stat-icon-gold {
  background: linear-gradient(135deg, #f5a623, #e8911a);
}

.stat-icon-orange {
  background: linear-gradient(135deg, #ff7e2e, #e8691a);
}

.stat-icon-yellow {
  background: linear-gradient(135deg, #ffbe35, #f4a900);
}

.stat-icon-green {
  background: linear-gradient(135deg, #0fc449, #18a94d);
}

.stat-content {
  margin-left: 15px;
}

.stat-label {
  color: #687a83;

  font-size: 12px;
}

.stat-value {
  margin-top: 2px;

  color: #14283b;

  font-size: 27px;

  line-height: 1.1;

  font-weight: 750;
}

.stat-change {
  display: flex;

  align-items: center;

  gap: 2px;

  margin-top: 5px;

  font-size: 10px;
}

.stat-change-gold {
  color: #d4880f;
}

.stat-change-orange {
  color: #e8691a;
}

.stat-change-yellow {
  color: #e9a400;
}

.stat-change-green {
  color: #12a34a;
}

.stat-arrow {
  position: absolute;

  right: 15px;
  bottom: 15px;

  width: 29px;
  height: 29px;

  display: flex;

  align-items: center;
  justify-content: center;

  border-radius: 50%;

  color: #d4880f;

  background: #fef6ea;
}

.stat-arrow-gold {
  color: #d4880f;
  background: #fef6ea;
}

.stat-arrow-orange {
  color: #e8691a;
  background: #fef0e8;
}

.stat-arrow-yellow {
  color: #e5a000;
  background: #fff8e8;
}

.stat-arrow-green {
  color: #12a34a;
  background: #effaf1;
}

/* =========================================================
   DASHBOARD GRID
========================================================= */

.dashboard-grid {
  display: grid;

  grid-template-columns: 1.45fr 1fr;

  gap: 16px;

  margin-top: 18px;
}

.dashboard-left,
.dashboard-right {
  display: flex;

  flex-direction: column;

  gap: 16px;
}

.dashboard-card {
  border-radius: 13px;

  background: #ffffff;

  box-shadow: 0 3px 12px rgba(30, 70, 42, 0.055);
}

.card-header {
  min-height: 62px;

  display: flex;

  align-items: center;

  justify-content: space-between;

  padding: 14px 20px;
}

.card-title-wrapper {
  display: flex;

  align-items: center;

  gap: 11px;
}

.card-title-wrapper h2 {
  margin: 0;

  color: #19354a;

  font-size: 16px;

  font-weight: 700;
}

.card-icon {
  width: 32px;
  height: 32px;

  display: flex;

  align-items: center;
  justify-content: center;

  border-radius: 8px;
}

.card-icon.gold {
  background: #fef6ea;

  color: #d4880f;
}

.card-icon.dark {
  background: #edf3f5;

  color: #19384b;
}

.view-all-btn {
  color: #d4880f;

  font-size: 11px;
}

/* =========================================================
   RECENT RECOGNITIONS
========================================================= */

.events-list {
  padding: 0 16px 15px;
}

.event-item {
  min-height: 84px;

  display: flex;

  align-items: center;

  gap: 14px;

  padding: 9px 8px;

  border: 1px solid #edf1ef;

  border-radius: 10px;

  margin-top: 9px;
}

.event-date {
  width: 76px;
  min-width: 76px;

  overflow: hidden;

  text-align: center;

  border: 1px solid #fef0e0;

  border-radius: 8px;

  background: #ffffff;
}

.event-month {
  padding: 5px;

  color: #ffffff;

  background: linear-gradient(90deg, #f5a623, #e8911a);

  font-size: 10px;

  font-weight: 700;
}

.event-day {
  padding: 5px;

  color: #172d3f;

  font-size: 20px;

  font-weight: 750;
}

.event-details {
  flex: 1;

  min-width: 0;
}

.event-title {
  color: #18344a;

  font-size: 12px;

  font-weight: 700;
}

.event-meta {
  display: flex;

  flex-wrap: wrap;

  gap: 10px;

  margin-top: 7px;

  color: #718089;

  font-size: 10px;
}

.event-meta span {
  display: flex;

  align-items: center;

  gap: 3px;
}

.event-meta .q-icon {
  font-size: 14px;
}

.event-status {
  padding: 7px 11px;

  border-radius: 20px;

  font-size: 9px;

  font-weight: 650;
}

.status-approved {
  color: #0c9145;

  background: #e1f7e6;
}

.status-pending {
  color: #dc9b00;

  background: #fff2cf;
}

/* =========================================================
   CALENDAR
========================================================= */

.calendar-card {
  min-height: 348px;
}

.calendar-controls {
  display: flex;

  align-items: center;

  gap: 8px;
}

.calendar-controls strong {
  min-width: 88px;

  text-align: center;

  color: #253a4b;

  font-size: 12px;
}

.today-btn {
  margin-left: 4px;

  padding: 0 9px;

  color: #52666f;

  border-color: #e2e9e5;

  border-radius: 7px;

  font-size: 10px;
}

.calendar {
  padding: 0 18px 18px;
}

.calendar-weekdays,
.calendar-days {
  display: grid;

  grid-template-columns: repeat(7, 1fr);
}

.calendar-weekdays {
  padding: 10px 0 20px;

  color: #71838d;

  font-size: 10px;

  text-align: center;
}

.calendar-days {
  border: 1px solid #edf1ef;

  border-bottom: none;
}

.calendar-day {
  position: relative;

  min-height: 55px;

  display: flex;

  align-items: center;
  justify-content: center;

  border-right: 1px solid #edf1ef;

  border-bottom: 1px solid #edf1ef;

  color: #243b4c;

  font-size: 10px;
}

.calendar-day:nth-child(7n) {
  border-right: none;
}

.calendar-day.muted {
  color: #aeb7bb;
}

.calendar-day.today {
  width: 34px;
  height: 34px;

  min-height: 34px;

  align-self: center;
  justify-self: center;

  border: none;

  border-radius: 50%;

  background: linear-gradient(135deg, #f5a623, #e8911a);

  color: #ffffff;

  font-weight: 700;
}

.calendar-dot {
  position: absolute;

  bottom: 5px;

  width: 5px;
  height: 5px;

  border-radius: 50%;
}

.gold-dot {
  background: #f5a623;
}

.orange-dot {
  background: #ff7e2e;
}

.green-dot {
  background: #16b84d;
}

.yellow-dot {
  background: #ffbf26;
}

/* =========================================================
   BOTTOM GRID
========================================================= */

.bottom-grid {
  display: grid;

  grid-template-columns: 1fr 1fr;

  gap: 16px;

  margin-top: 16px;
}

/* =========================================================
   TOP PERFORMERS
========================================================= */

.performers-list {
  padding: 0 20px 18px;
}

.performer-item {
  display: flex;

  align-items: center;

  gap: 12px;

  padding: 10px 0;

  border-top: 1px solid #edf1ef;
}

.performer-item:first-child {
  border-top: none;
}

.performer-rank {
  width: 24px;
  height: 24px;

  display: flex;

  align-items: center;
  justify-content: center;

  border-radius: 50%;

  background: #f0f2f5;

  color: #52666f;

  font-size: 11px;

  font-weight: 700;
}

.performer-avatar {
  width: 36px;
  height: 36px;

  font-size: 12px;

  font-weight: 600;
}

.performer-avatar[color="gold"] {
  background: linear-gradient(135deg, #f5a623, #e8911a);
  color: #ffffff;
}

.performer-avatar[color="silver"] {
  background: linear-gradient(135deg, #c0c0c0, #a0a0a0);
  color: #ffffff;
}

.performer-avatar[color="bronze"] {
  background: linear-gradient(135deg, #cd7f32, #b87333);
  color: #ffffff;
}

.performer-info {
  flex: 1;
}

.performer-name {
  color: #18344a;

  font-size: 12px;

  font-weight: 700;
}

.performer-dept {
  color: #718089;

  font-size: 10px;
}

.performer-points {
  display: flex;

  align-items: center;

  gap: 4px;

  color: #d4880f;

  font-size: 12px;

  font-weight: 700;
}

.star-icon {
  color: #f5a623;
}

/* =========================================================
   QUICK ACTIONS
========================================================= */

.actions-grid {
  display: grid;

  grid-template-columns: repeat(4, 1fr);

  gap: 12px;

  padding: 0 20px 20px;
}

.action-item {
  display: flex;

  flex-direction: column;

  align-items: center;

  gap: 8px;

  padding: 16px 8px;

  border: 1px solid #edf1ef;

  border-radius: 10px;

  cursor: pointer;

  transition: all 0.2s ease;
}

.action-item:hover {
  border-color: #f5a623;

  background: #fef6ea;

  transform: translateY(-2px);
}

.action-icon {
  width: 48px;
  height: 48px;

  display: flex;

  align-items: center;
  justify-content: center;

  border-radius: 12px;

  color: #ffffff;
}

.action-icon.gold {
  background: linear-gradient(135deg, #f5a623, #e8911a);
}

.action-icon.orange {
  background: linear-gradient(135deg, #ff7e2e, #e8691a);
}

.action-icon.yellow {
  background: linear-gradient(135deg, #ffbe35, #f4a900);
}

.action-icon.green {
  background: linear-gradient(135deg, #0fc449, #18a94d);
}

.action-label {
  color: #435966;

  font-size: 10px;

  font-weight: 600;
}

/* =========================================================
   LARGE TABLET
========================================================= */

@media (max-width: 1200px) {
  .statistics-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .bottom-grid {
    grid-template-columns: 1fr;
  }

  .welcome-city-hall {
    width: 280px;
  }
}

/* =========================================================
   TABLET
========================================================= */

@media (max-width: 900px) {
  .dashboard-page {
    padding: 14px;
  }

  .welcome-banner {
    min-height: 145px;

    padding: 25px;
  }

  .welcome-city-hall {
    width: 250px;

    right: -15px;
  }
}

/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 600px) {
  .dashboard-page {
    padding: 10px;
  }

  .welcome-banner {
    min-height: 180px;

    padding: 22px;

    align-items: flex-start;
  }

  .welcome-content h1 {
    font-size: 25px;
  }

  .welcome-content p {
    max-width: 230px;

    font-size: 11px;
  }

  .welcome-city-hall {
    width: 210px;

    right: -15px;

    bottom: -3px;

    opacity: 0.95;
  }

  .statistics-grid {
    grid-template-columns: 1fr;

    gap: 10px;
  }

  .stat-card {
    min-height: 100px;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;

    gap: 10px;
  }

  .dashboard-left,
  .dashboard-right {
    gap: 10px;
  }

  .bottom-grid {
    grid-template-columns: 1fr;

    gap: 10px;
  }

  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .event-item {
    align-items: flex-start;

    flex-wrap: wrap;
  }

  .event-details {
    min-width: calc(100% - 105px);
  }

  .event-status {
    margin-left: 90px;
  }

  .calendar-controls strong {
    min-width: auto;
  }

  .today-btn {
    display: none;
  }

  .calendar-day {
    min-height: 38px;
  }
}

/* =========================================================
   VERY SMALL MOBILE
========================================================= */

@media (max-width: 400px) {
  .welcome-city-hall {
    width: 180px;
  }

  .welcome-content h1 {
    font-size: 22px;
  }

  .welcome-content p {
    font-size: 10px;
  }

  .stat-icon {
    width: 52px;
    height: 52px;

    min-width: 52px;
  }

  .stat-value {
    font-size: 23px;
  }

  .event-date {
    width: 62px;
    min-width: 62px;
  }

  .event-title {
    font-size: 11px;
  }

  .event-meta {
    flex-direction: column;

    gap: 3px;
  }

  .actions-grid {
    grid-template-columns: 1fr 1fr;
  }

  .performer-item {
    flex-wrap: wrap;
  }

  .performer-points {
    margin-left: 36px;
  }
}
</style>
