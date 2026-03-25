import { CommunityListClient } from "@/components/dashboard/community-list";

export default function CommunitiesPage() {
  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-[var(--font-headline)] text-3xl font-extrabold tracking-tight">
            Networking Hub
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Connect, vouch, and grow with professionals in your field.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Search bar */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xl">search</span>
            <input
              type="text"
              placeholder="Search communities..."
              className="pl-10 pr-4 py-2 w-64 bg-muted border border-border rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>
          {/* Notifications bell */}
          <button className="relative w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center hover:bg-muted/80 transition-colors">
            <span className="material-symbols-outlined text-foreground text-xl">notifications</span>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center">3</span>
          </button>
        </div>
      </div>

      {/* ── Top Row: Referral Widget + Vouch Quick Action ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Referral Widget */}
        <div className="lg:col-span-2 bg-primary text-primary-foreground rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-2xl">diversity_3</span>
                <h2 className="font-[var(--font-headline)] text-xl font-bold">Build your circle. Earn rewards.</h2>
              </div>
              <p className="text-sm text-primary-foreground/80">
                Refer talented professionals and grow your network. Each successful referral boosts your Vouch Score.
              </p>

              {/* Referral Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold">Level 3 Referrer</span>
                  <span className="text-primary-foreground/70">3/5 referrals</span>
                </div>
                <div className="w-full h-2.5 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full transition-all" style={{ width: "60%" }} />
                </div>
                <p className="text-xs text-primary-foreground/60">2 more referrals to reach Level 4</p>
              </div>
            </div>

            <button className="px-6 py-3 bg-white text-primary font-semibold rounded-xl text-sm hover:bg-white/90 transition-colors flex items-center gap-2 flex-shrink-0">
              <span className="material-symbols-outlined text-lg">person_add</span>
              Refer a Friend
            </button>
          </div>
        </div>

        {/* Vouch Quick Action Card */}
        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-2xl">thumb_up</span>
            </div>
            <h3 className="font-[var(--font-headline)] text-lg font-bold">Vouch for a Peer</h3>
            <p className="text-sm text-muted-foreground">
              Endorse colleagues you trust. Your vouch helps them stand out to employers.
            </p>
          </div>
          <button className="mt-4 w-full py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-lg">search</span>
            Search Contacts
          </button>
        </div>
      </div>

      {/* ── Main Grid: Communities + Sidebar ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left: Skill Communities ── */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="font-[var(--font-headline)] text-xl font-bold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">communities</span>
              Skill Communities
            </h2>

            {/* Community List (preserves all backend functionality) */}
            <CommunityListClient />
          </div>

          {/* ── Trending Discussions ── */}
          <div>
            <h2 className="font-[var(--font-headline)] text-xl font-bold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">trending_up</span>
              Trending Discussions
            </h2>

            <div className="bg-card border border-border rounded-2xl divide-y divide-border">
              {/* Discussion Thread 1 */}
              <div className="p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold flex-shrink-0">
                    A
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-sm font-semibold">Alex Chen</span>
                      <span className="material-symbols-outlined text-primary text-sm">verified</span>
                      <span className="text-xs text-muted-foreground">in React Engineers</span>
                    </div>
                    <p className="text-sm text-foreground line-clamp-2">
                      What are your favorite patterns for managing server state in Next.js App Router? I&apos;ve been comparing different approaches...
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span className="material-symbols-outlined text-sm">chat_bubble</span>
                        24 replies
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span className="material-symbols-outlined text-sm">favorite</span>
                        18 likes
                      </span>
                      <span className="text-xs text-muted-foreground">2h ago</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Discussion Thread 2 */}
              <div className="p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold flex-shrink-0">
                    S
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-sm font-semibold">Sarah Kim</span>
                      <span className="material-symbols-outlined text-primary text-sm">verified</span>
                      <span className="text-xs text-muted-foreground">in Product Design</span>
                    </div>
                    <p className="text-sm text-foreground line-clamp-2">
                      Just published my design system case study. Would love feedback from the community on the component architecture decisions.
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span className="material-symbols-outlined text-sm">chat_bubble</span>
                        12 replies
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span className="material-symbols-outlined text-sm">favorite</span>
                        31 likes
                      </span>
                      <span className="text-xs text-muted-foreground">5h ago</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Discussion Thread 3 */}
              <div className="p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold flex-shrink-0">
                    M
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-sm font-semibold">Marcus Johnson</span>
                      <span className="text-xs text-muted-foreground">in Data Engineering</span>
                    </div>
                    <p className="text-sm text-foreground line-clamp-2">
                      Anyone hiring mid-level data engineers? I&apos;m looking to make a move. Open to remote roles in the US.
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span className="material-symbols-outlined text-sm">chat_bubble</span>
                        8 replies
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span className="material-symbols-outlined text-sm">favorite</span>
                        5 likes
                      </span>
                      <span className="text-xs text-muted-foreground">1d ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Sidebar: Peers Near You ── */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="font-[var(--font-headline)] text-base font-bold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">near_me</span>
              Peers Near You
            </h3>
            <div className="space-y-4">
              {/* Peer 1 */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold flex-shrink-0">
                  J
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">Jordan Rivera</p>
                  <p className="text-xs text-muted-foreground truncate">Full-Stack Engineer</p>
                </div>
                <button className="text-xs text-primary font-medium hover:underline flex-shrink-0">
                  Connect
                </button>
              </div>

              {/* Peer 2 */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold flex-shrink-0">
                  T
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">Taylor Park</p>
                  <p className="text-xs text-muted-foreground truncate">Product Designer</p>
                </div>
                <button className="text-xs text-primary font-medium hover:underline flex-shrink-0">
                  Connect
                </button>
              </div>

              {/* Peer 3 */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold flex-shrink-0">
                  N
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">Nadia Osman</p>
                  <p className="text-xs text-muted-foreground truncate">Data Scientist</p>
                </div>
                <button className="text-xs text-primary font-medium hover:underline flex-shrink-0">
                  Connect
                </button>
              </div>

              {/* Peer 4 */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold flex-shrink-0">
                  R
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">Ryan Patel</p>
                  <p className="text-xs text-muted-foreground truncate">DevOps Engineer</p>
                </div>
                <button className="text-xs text-primary font-medium hover:underline flex-shrink-0">
                  Connect
                </button>
              </div>

              {/* Peer 5 */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold flex-shrink-0">
                  L
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">Lisa Nguyen</p>
                  <p className="text-xs text-muted-foreground truncate">UX Researcher</p>
                </div>
                <button className="text-xs text-primary font-medium hover:underline flex-shrink-0">
                  Connect
                </button>
              </div>
            </div>

            <button className="w-full mt-4 py-2 bg-muted text-foreground text-sm font-medium rounded-xl hover:bg-muted/80 transition-colors flex items-center justify-center gap-1.5">
              <span className="material-symbols-outlined text-base">explore</span>
              View All Nearby
            </button>
          </div>

          {/* Quick Stats */}
          <div className="bg-muted rounded-2xl p-6 space-y-4">
            <h3 className="font-[var(--font-headline)] text-base font-bold">Your Network</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <p className="text-2xl font-extrabold text-primary">12</p>
                <p className="text-xs text-muted-foreground">Communities</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-extrabold text-primary">48</p>
                <p className="text-xs text-muted-foreground">Connections</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-extrabold text-primary">7</p>
                <p className="text-xs text-muted-foreground">Vouches Given</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-extrabold text-primary">3</p>
                <p className="text-xs text-muted-foreground">Referrals</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
