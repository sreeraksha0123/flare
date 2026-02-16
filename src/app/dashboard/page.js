"use client";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  ExternalLink,
  Search,
  LogOut,
  Bookmark,
  Clock,
  Globe,
  Tag,
  Copy,
  Check,
  Filter,
  Grid3x3,
  List,
  ChevronDown,
  X,
  Calendar,
  Link2,
  FolderOpen
} from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [adding, setAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const [sortBy, setSortBy] = useState("newest");
  const [copiedId, setCopiedId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const broadcastRef = useRef(null);
  const tabIdRef = useRef(null);
  const mutationCounterRef = useRef(0);

  // Generate a truly unique ID for optimistic updates
  const generateUniqueId = () => {
    mutationCounterRef.current += 1;
    return `temp-${Date.now()}-${mutationCounterRef.current}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Extract unique domains for filtering
  const getDomainFromUrl = (url) => {
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      return domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1);
    } catch {
      return null;
    }
  };

  const folders = ["all", ...new Set(bookmarks
    .map(b => getDomainFromUrl(b.url))
    .filter(Boolean)
  )].slice(0, 8);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push("/");
          return;
        }
        setUser(session.user);
        await fetchBookmarks(session.user.id);
      } catch (error) {
        console.error("Error checking session:", error);
      }
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  // BroadcastChannel for multi-tab sync
  useEffect(() => {
    tabIdRef.current = crypto?.randomUUID?.() || `tab-${Date.now()}-${Math.random()}`;

    if (typeof window === "undefined" || !window.BroadcastChannel) return;

    const channel = new BroadcastChannel("webwise-sync");
    broadcastRef.current = channel;

    channel.onmessage = (event) => {
      const msg = event?.data;
      if (!msg || msg.tabId === tabIdRef.current || !user?.id || msg.userId !== user.id) return;

      if (msg.type === "bookmark_add") {
        setBookmarks(prev => {
          // Check if bookmark already exists to prevent duplicates
          if (prev.some(b => b.id === msg.bookmark.id)) return prev;
          return [msg.bookmark, ...prev];
        });
      } else if (msg.type === "bookmark_delete") {
        setBookmarks(prev => prev.filter(b => b.id !== msg.id));
      }
    };

    return () => channel.close();
  }, [user]);

  const fetchBookmarks = async (userId) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("bookmarks")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBookmarks(data || []);
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
    } finally {
      setLoading(false);
    }
  };

  // Realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("bookmarks-realtime")
      .on("postgres_changes", 
        { event: "INSERT", schema: "public", table: "bookmarks", filter: `user_id=eq.${user.id}` },
        (payload) => {
          setBookmarks(prev => {
            // Check if bookmark already exists
            if (prev.some(b => b.id === payload.new.id)) return prev;
            return [payload.new, ...prev];
          });
        }
      )
      .on("postgres_changes",
        { event: "DELETE", schema: "public", table: "bookmarks", filter: `user_id=eq.${user.id}` },
        (payload) => {
          setBookmarks(prev => prev.filter(b => b.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user]);

  const handleAddBookmark = async (e) => {
    e.preventDefault();
    if (!title.trim() || !url.trim() || !user) return;

    setAdding(true);
    let finalUrl = url.trim();
    if (!/^https?:\/\//i.test(finalUrl)) finalUrl = "https://" + finalUrl;

    const tempId = generateUniqueId();
    const optimisticBookmark = {
      id: tempId,
      user_id: user.id,
      title: title.trim(),
      url: finalUrl,
      created_at: new Date().toISOString(),
      isOptimistic: true
    };

    // Optimistic update
    setBookmarks(prev => [optimisticBookmark, ...prev]);

    try {
      const { data, error } = await supabase
        .from("bookmarks")
        .insert([{ user_id: user.id, title: title.trim(), url: finalUrl }])
        .select()
        .single();

      if (error) throw error;

      // Replace optimistic bookmark with real one
      setBookmarks(prev => {
        const filtered = prev.filter(b => b.id !== tempId);
        // Check if real bookmark already exists (from broadcast)
        if (filtered.some(b => b.id === data.id)) return filtered;
        return [data, ...filtered];
      });
      
      setTitle("");
      setUrl("");
      
      broadcastRef.current?.postMessage({
        type: "bookmark_add",
        tabId: tabIdRef.current,
        userId: user.id,
        bookmark: data,
      });
    } catch (error) {
      // Remove optimistic bookmark on error
      setBookmarks(prev => prev.filter(b => b.id !== tempId));
      console.error("Error adding bookmark:", error);
      alert("Failed to add bookmark. Please try again.");
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteBookmark = async (id) => {
    // Don't delete optimistic bookmarks
    if (id.toString().startsWith('temp-')) return;

    const deletedBookmark = bookmarks.find(b => b.id === id);
    setBookmarks(prev => prev.filter(b => b.id !== id));
    
    broadcastRef.current?.postMessage({
      type: "bookmark_delete",
      tabId: tabIdRef.current,
      userId: user?.id,
      id,
    });

    try {
      const { error } = await supabase.from("bookmarks").delete().eq("id", id);
      if (error) throw error;
    } catch (error) {
      // Rollback on error
      setBookmarks(prev => [deletedBookmark, ...prev]);
      console.error("Error deleting bookmark:", error);
      alert("Failed to delete bookmark. Please try again.");
    }
  };

  const handleCopyUrl = async (url, id) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error("Error copying URL:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const formatDate = (date) => {
    try {
      const now = new Date();
      const then = new Date(date);
      const diffDays = Math.floor((now - then) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return "Unknown date";
    }
  };

  const getFaviconUrl = (url) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return null;
    }
  };

  // Filter bookmarks based on search, folder, and date
  const filteredBookmarks = bookmarks
    .filter(b => {
      // Don't show optimistic bookmarks in count? They're fine to show
      const matchesSearch = searchQuery === "" || 
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.url.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFolder = selectedFolder === "all" || 
        (() => {
          try {
            const domain = new URL(b.url).hostname.replace('www.', '').split('.')[0];
            return domain.toLowerCase() === selectedFolder.toLowerCase();
          } catch {
            return false;
          }
        })();

      const matchesDate = (() => {
        if (dateFilter === "all") return true;
        try {
          const daysAgo = Math.floor((new Date() - new Date(b.created_at)) / (1000 * 60 * 60 * 24));
          if (dateFilter === "today") return daysAgo === 0;
          if (dateFilter === "week") return daysAgo <= 7;
          if (dateFilter === "month") return daysAgo <= 30;
        } catch {
          return false;
        }
        return true;
      })();

      return matchesSearch && matchesFolder && matchesDate;
    })
    .sort((a, b) => {
      try {
        if (sortBy === "newest") return new Date(b.created_at) - new Date(a.created_at);
        if (sortBy === "oldest") return new Date(a.created_at) - new Date(b.created_at);
        if (sortBy === "title") return a.title.localeCompare(b.title);
      } catch {
        return 0;
      }
      return 0;
    });

  const stats = {
    total: bookmarks.filter(b => !b.isOptimistic).length,
    folders: new Set(bookmarks.map(b => {
      try { return new URL(b.url).hostname.replace('www.', '').split('.')[0]; } catch { return null; }
    }).filter(Boolean)).size,
    recent: bookmarks.filter(b => {
      try {
        return !b.isOptimistic && new Date(b.created_at) > new Date(Date.now() - 7*24*60*60*1000);
      } catch {
        return false;
      }
    }).length
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B1120]">
        <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1120]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0B1120]/80 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Bookmark className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Flare</h1>
                <p className="text-xs text-gray-400">by Sree Raksha</p>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-2 bg-gray-800/50 rounded-xl border border-gray-700/50">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                  {user?.email?.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-200">{user?.email?.split('@')[0]}</p>
                  <p className="text-xs text-gray-400">{user?.email}</p>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="p-2.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                title="Sign out"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-8 sm:mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1.5 h-8 bg-indigo-500 rounded-full"></div>
            <h2 className="text-xl sm:text-2xl font-semibold text-white">
              Welcome back, <span className="text-indigo-400">{user?.email?.split('@')[0]}</span>
            </h2>
          </div>
          <p className="text-sm sm:text-base text-gray-400 ml-4">Manage and organize your digital collection</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-8 sm:mb-10">
          <div className="bg-gray-800/50 p-5 sm:p-6 rounded-2xl border border-gray-700/50 hover:bg-gray-800/80 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-indigo-500/10 rounded-lg">
                <Bookmark className="w-5 h-5 text-indigo-400" />
              </div>
              <span className="text-xl sm:text-2xl font-bold text-white">{stats.total}</span>
            </div>
            <p className="text-sm font-medium text-gray-300">Total Bookmarks</p>
            <p className="text-xs text-gray-500 mt-1">Your collection</p>
          </div>
          
          <div className="bg-gray-800/50 p-5 sm:p-6 rounded-2xl border border-gray-700/50 hover:bg-gray-800/80 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <FolderOpen className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-xl sm:text-2xl font-bold text-white">{stats.folders}</span>
            </div>
            <p className="text-sm font-medium text-gray-300">Categories</p>
            <p className="text-xs text-gray-500 mt-1">Unique domains</p>
          </div>
          
          <div className="bg-gray-800/50 p-5 sm:p-6 rounded-2xl border border-gray-700/50 hover:bg-gray-800/80 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-pink-500/10 rounded-lg">
                <Calendar className="w-5 h-5 text-pink-400" />
              </div>
              <span className="text-xl sm:text-2xl font-bold text-white">{stats.recent}</span>
            </div>
            <p className="text-sm font-medium text-gray-300">Added This Week</p>
            <p className="text-xs text-gray-500 mt-1">Last 7 days</p>
          </div>
        </div>

        {/* Add Bookmark Form */}
        <div className="bg-gray-800/50 p-5 sm:p-6 rounded-2xl border border-gray-700/50 mb-6 sm:mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-indigo-500/20 rounded-lg">
              <Plus size={16} className="text-indigo-400" />
            </div>
            <h3 className="font-medium text-white">Add New Bookmark</h3>
          </div>
          
          <form onSubmit={handleAddBookmark} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., GitHub Docs"
              className="flex-1 px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-gray-200 placeholder-gray-500"
              required
            />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://github.com/docs"
              className="flex-1 px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-gray-200 placeholder-gray-500"
              required
            />
            <button
              type="submit"
              disabled={adding}
              className="px-5 sm:px-6 py-2.5 bg-indigo-500 text-white font-medium rounded-xl hover:bg-indigo-600 transition-colors disabled:opacity-50 min-w-[100px] shadow-lg shadow-indigo-500/20"
            >
              {adding ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
              ) : (
                "Add"
              )}
            </button>
          </form>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search bookmarks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-gray-200 placeholder-gray-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                <X size={14} />
              </button>
            )}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
                showFilters 
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                  : 'bg-gray-800/50 border border-gray-700 text-gray-400 hover:bg-gray-700/50'
              }`}
            >
              <Filter size={16} />
              <span className="hidden sm:inline">Filters</span>
              <ChevronDown size={14} className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            
            <div className="flex bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 transition-all ${
                  viewMode === 'list' 
                    ? 'bg-indigo-500/20 text-indigo-400' 
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
                }`}
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-indigo-500/20 text-indigo-400' 
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
                }`}
              >
                <Grid3x3 size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="bg-gray-800/50 p-5 sm:p-6 rounded-2xl border border-gray-700/50">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                      Sort By
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-gray-200"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="title">Title (A-Z)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                      Category
                    </label>
                    <select
                      value={selectedFolder}
                      onChange={(e) => setSelectedFolder(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-gray-200"
                    >
                      {folders.map(folder => (
                        <option key={folder} value={folder}>
                          {folder === 'all' ? 'All Categories' : folder}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                      Date Added
                    </label>
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-gray-200"
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                    </select>
                  </div>
                </div>

                {/* Active filters */}
                {(searchQuery || selectedFolder !== 'all' || dateFilter !== 'all') && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-gray-400">Active filters:</span>
                      {searchQuery && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs">
                          Search: {searchQuery}
                          <button onClick={() => setSearchQuery("")} className="hover:text-white">
                            <X size={12} />
                          </button>
                        </span>
                      )}
                      {selectedFolder !== 'all' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs">
                          Category: {selectedFolder}
                          <button onClick={() => setSelectedFolder("all")} className="hover:text-white">
                            <X size={12} />
                          </button>
                        </span>
                      )}
                      {dateFilter !== 'all' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-pink-500/20 text-pink-300 rounded-full text-xs">
                          Date: {dateFilter === 'today' ? 'Today' : dateFilter === 'week' ? 'This Week' : 'This Month'}
                          <button onClick={() => setDateFilter("all")} className="hover:text-white">
                            <X size={12} />
                          </button>
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results count */}
        <div className="flex items-center justify-between mb-4 px-2">
          <p className="text-sm text-gray-400">
            Showing <span className="text-white font-medium">{filteredBookmarks.length}</span> of <span className="text-white font-medium">{bookmarks.filter(b => !b.isOptimistic).length}</span> bookmarks
          </p>
        </div>

        {/* Bookmarks Grid/List */}
        {loading ? (
          <div className="text-center py-16 sm:py-20">
            <div className="inline-block w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
            <p className="text-sm sm:text-base text-gray-400">Loading your collection...</p>
          </div>
        ) : filteredBookmarks.length === 0 ? (
          <div className="text-center py-16 sm:py-20 bg-gray-800/30 rounded-2xl border border-gray-700/50">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Bookmark className="w-8 h-8 sm:w-10 sm:h-10 text-gray-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">No bookmarks found</h3>
            <p className="text-sm sm:text-base text-gray-400">
              {bookmarks.length === 0 
                ? "Start by adding your first bookmark" 
                : "Try adjusting your filters"}
            </p>
          </div>
        ) : viewMode === 'list' ? (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredBookmarks.map((bookmark) => (
                <motion.div
                  key={bookmark.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  layout
                  className="group bg-gray-800/50 p-4 rounded-xl border border-gray-700/50 hover:border-gray-600/50 hover:bg-gray-800/80 transition-all"
                >
                  <div className="flex items-start gap-4">
                    {/* Favicon */}
                    <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center flex-shrink-0 border border-gray-700">
                      {getFaviconUrl(bookmark.url) ? (
                        <img src={getFaviconUrl(bookmark.url)} alt="" className="w-5 h-5" />
                      ) : (
                        <Link2 className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-medium text-white mb-0.5 group-hover:text-indigo-400 transition-colors">
                            {bookmark.title}
                            {bookmark.isOptimistic && (
                              <span className="ml-2 text-xs text-indigo-400 animate-pulse">Saving...</span>
                            )}
                          </h3>
                          <a
                            href={bookmark.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-gray-400 hover:text-indigo-400 break-all line-clamp-1 transition-colors"
                          >
                            {bookmark.url}
                          </a>
                        </div>
                        
                        {/* Actions - Hide for optimistic bookmarks */}
                        {!bookmark.isOptimistic && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleCopyUrl(bookmark.url, bookmark.id)}
                              className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                              title="Copy URL"
                            >
                              {copiedId === bookmark.id ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                            </button>
                            <a
                              href={bookmark.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                              title="Open link"
                            >
                              <ExternalLink size={14} />
                            </a>
                            <button
                              onClick={() => handleDeleteBookmark(bookmark.id)}
                              className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {/* Metadata */}
                      <div className="flex items-center gap-4 mt-2 text-xs">
                        <div className="flex items-center gap-1 text-gray-500">
                          <Clock size={12} />
                          <span>{formatDate(bookmark.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                          <Tag size={12} />
                          <span>
                            {(() => {
                              try {
                                return new URL(bookmark.url).hostname.replace('www.', '');
                              } catch {
                                return 'unknown';
                              }
                            })()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredBookmarks.map((bookmark) => (
                <motion.div
                  key={bookmark.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  layout
                  className="group bg-gray-800/50 p-4 sm:p-5 rounded-xl border border-gray-700/50 hover:border-gray-600/50 hover:bg-gray-800/80 transition-all"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center border border-gray-700">
                      {getFaviconUrl(bookmark.url) ? (
                        <img src={getFaviconUrl(bookmark.url)} alt="" className="w-5 h-5" />
                      ) : (
                        <Link2 className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white truncate group-hover:text-indigo-400 transition-colors">
                        {bookmark.title}
                        {bookmark.isOptimistic && (
                          <span className="ml-2 text-xs text-indigo-400 animate-pulse">Saving...</span>
                        )}
                      </h3>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {(() => {
                          try {
                            return new URL(bookmark.url).hostname.replace('www.', '');
                          } catch {
                            return 'unknown';
                          }
                        })()}
                      </p>
                    </div>
                  </div>
                  
                  <a
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-400 hover:text-indigo-400 break-all line-clamp-2 mb-3 transition-colors"
                  >
                    {bookmark.url}
                  </a>
                  
                  {!bookmark.isOptimistic && (
                    <div className="flex items-center justify-between pt-3 border-t border-gray-700/50">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock size={12} />
                        <span>{formatDate(bookmark.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleCopyUrl(bookmark.url, bookmark.id)}
                          className="p-1.5 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                        >
                          {copiedId === bookmark.id ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                        </button>
                        <a
                          href={bookmark.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                        >
                          <ExternalLink size={12} />
                        </a>
                        <button
                          onClick={() => handleDeleteBookmark(bookmark.id)}
                          className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-10 sm:mt-12 pt-5 sm:pt-6 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-gray-500">
              © 2026 Flare. Engineered by Sree Raksha S P with ❤️. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-600">
                {filteredBookmarks.length} items • {stats.folders} categories
              </span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}