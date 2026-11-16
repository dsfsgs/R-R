<template>
  <div class="event-two-column-layout">
    <q-card flat bordered class="event-card left-card">
      <slot name="left" />
    </q-card>

    <q-card flat bordered class="event-card right-card">
      <div class="right-card-body">
        <slot name="right" />
      </div>
    </q-card>
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "TwoColumnLayout",
});
</script>

<style scoped>
/* =========================================================
   RESPONSIVE STRATEGY
   - Mobile / tablet (< 1024px): single column, natural page
     scroll, no fixed heights.
   - Desktop (>= 1024px): two columns. Height follows the
     viewport (with sane min/max) instead of a fixed 680px,
     so short laptop screens never clip the cards.
========================================================= */

/* ---------- Base: stacked ---------- */
.event-two-column-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 12px;
  align-items: start;
}

.event-card {
  min-width: 0;
  border: 2px solid #f0f1f5;
  border-radius: 0;
  background: #ffffff;
  box-shadow: none;
}

.left-card {
  padding: 16px;
}

.right-card {
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
}

.right-card-body {
  flex: 1;
  min-width: 0;
  min-height: 0;
  padding: 16px;
}

/* ---------- >= 600px: a bit more breathing room ---------- */
@media (min-width: 600px) {
  .left-card {
    padding: 20px 22px;
  }

  .right-card-body {
    padding: 20px;
  }
}

/* ---------- >= 1024px: side-by-side, fills the space its parent gives it ---------- */
@media (min-width: 1024px) {
  .event-two-column-layout {
    grid-template-columns: clamp(300px, 28vw, 346px) minmax(0, 1fr);
    grid-template-rows: minmax(0, 1fr);
    align-items: stretch;
    height: 100%;
    min-height: 420px;
  }

  /* Height comes from the parent (the page), not from a guess */
  .left-card,
  .right-card {
    height: auto;
    min-height: 0;
  }

  /* Left column scrolls on its own if the roster gets long */
  .left-card {
    overflow-y: auto;
  }

  /* Right column: content scrolls inside the card */
  .right-card-body {
    overflow-y: auto;
    overscroll-behavior: contain;
  }
}

/* ---------- Slim scrollbars (desktop only) ---------- */
.right-card-body::-webkit-scrollbar,
.left-card::-webkit-scrollbar {
  width: 4px;
}
.right-card-body::-webkit-scrollbar-track,
.left-card::-webkit-scrollbar-track {
  background: transparent;
}
.right-card-body::-webkit-scrollbar-thumb,
.left-card::-webkit-scrollbar-thumb {
  background: #d8dce0;
  border-radius: 4px;
}
</style>
