"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Search,
  Sparkles,
  BookOpen,
  Film,
  Gamepad2,
  Music,
  Globe,
  FlaskConical,
  Landmark,
  Users,
  Utensils,
  Palette,
  Trophy,
  Clock,
  Cpu,
  Heart,
  Scroll,
  Mountain,
  Swords,
  Star,
  Zap,
  Play,
} from "lucide-react";
import { CATEGORIES } from "@/lib/types";

// Category groupings for filtering
const CATEGORY_GROUPS = {
  all: { label: "All", icon: Sparkles },
  entertainment: { label: "Entertainment", icon: Film },
  gaming: { label: "Gaming", icon: Gamepad2 },
  music: { label: "Music", icon: Music },
  history: { label: "History", icon: Landmark },
  science: { label: "Science", icon: FlaskConical },
  geography: { label: "Geography", icon: Globe },
  literature: { label: "Literature", icon: BookOpen },
  sports: { label: "Sports", icon: Trophy },
  food: { label: "Food & Drink", icon: Utensils },
  arts: { label: "Arts", icon: Palette },
  tech: { label: "Technology", icon: Cpu },
  culture: { label: "Culture", icon: Users },
  lifestyle: { label: "Lifestyle", icon: Heart },
  mythology: { label: "Mythology", icon: Scroll },
} as const;

// Map categories to groups
const getCategoryGroup = (category: string): keyof typeof CATEGORY_GROUPS => {
  const cat = category.toLowerCase();

  // Gaming
  if (cat.includes("video game") || cat.includes("gaming") || cat.includes("mario") ||
      cat.includes("zelda") || cat.includes("pokémon") || cat.includes("minecraft") ||
      cat.includes("fortnite") || cat.includes("warcraft") || cat.includes("elder scrolls") ||
      cat.includes("fallout") || cat.includes("halo") || cat.includes("souls") ||
      cat.includes("witcher") || cat.includes("resident evil") || cat.includes("metal gear") ||
      cat.includes("god of war") || cat.includes("assassin") || cat.includes("call of duty") ||
      cat.includes("grand theft") || cat.includes("league of legends") || cat.includes("esports") ||
      cat.includes("speedrunning") || cat.includes("retro gaming") || cat.includes("mobile gaming") ||
      cat.includes("indie games") || cat.includes("game development") || cat.includes("playstation") ||
      cat.includes("xbox") || cat.includes("nintendo")) return "gaming";

  // Music (artists and genres)
  if (cat.includes("music") || cat.includes("beatles") || cat.includes("rolling stones") ||
      cat.includes("zeppelin") || cat.includes("pink floyd") || cat.includes("queen") ||
      cat.includes("bowie") || cat.includes("dylan") || cat.includes("jackson") ||
      cat.includes("madonna") || cat.includes("prince") || cat.includes("nirvana") ||
      cat.includes("radiohead") || cat.includes("kanye") || cat.includes("beyoncé") ||
      cat.includes("taylor swift") || cat.includes("grateful dead") || cat.includes("wu-tang") ||
      cat.includes("daft punk") || cat.includes("metallica") || cat.includes("ac/dc") ||
      cat.includes("jazz") || cat.includes("hip hop") || cat.includes("rock") ||
      cat.includes("country") || cat.includes("electronic") || cat.includes("classical") ||
      cat.includes("piano") || cat.includes("guitar") || cat.includes("violin") ||
      cat.includes("drums") || cat.includes("synthesizer") || cat.includes("brass") ||
      cat.includes("woodwind") || cat.includes("instrument") || cat.includes("opera") ||
      cat.includes("film score")) return "music";

  // Entertainment (Film, TV, Animation)
  if (cat.includes("film") || cat.includes("tv") || cat.includes("movie") ||
      cat.includes("star wars") || cat.includes("star trek") || cat.includes("marvel") ||
      cat.includes("dc comics") || cat.includes("bond") || cat.includes("indiana jones") ||
      cat.includes("jurassic") || cat.includes("matrix") || cat.includes("breaking bad") ||
      cat.includes("sopranos") || cat.includes("wire") || cat.includes("friends") ||
      cat.includes("seinfeld") || cat.includes("office") || cat.includes("doctor who") ||
      cat.includes("stranger things") || cat.includes("simpsons") || cat.includes("south park") ||
      cat.includes("rick and morty") || cat.includes("black mirror") || cat.includes("parks and") ||
      cat.includes("arrested") || cat.includes("anime") || cat.includes("manga") ||
      cat.includes("broadway") || cat.includes("theater") || cat.includes("comedy") ||
      cat.includes("reality tv") || cat.includes("award") || cat.includes("disney") ||
      cat.includes("pixar") || cat.includes("ghibli") || cat.includes("dreamworks") ||
      cat.includes("animation") || cat.includes("cartoon") || cat.includes("voice acting") ||
      cat.includes("director") || cat.includes("screenwriting") || cat.includes("cinematography") ||
      cat.includes("horror film") || cat.includes("comedy film") || cat.includes("action movie") ||
      cat.includes("romantic") || cat.includes("documentary") || cat.includes("foreign film") ||
      cat.includes("silent film") || cat.includes("hollywood") || cat.includes("podcast") ||
      cat.includes("youtube") || cat.includes("tiktok") || cat.includes("twitch") ||
      cat.includes("streaming") || cat.includes("netflix") || cat.includes("comic book")) return "entertainment";

  // History
  if (cat.includes("history") || cat.includes("ancient") || cat.includes("medieval") ||
      cat.includes("renaissance") || cat.includes("exploration") || cat.includes("industrial") ||
      cat.includes("world war") || cat.includes("cold war") || cat.includes("revolution") ||
      cat.includes("civil war") || cat.includes("apollo") || cat.includes("berlin wall") ||
      cat.includes("manhattan project") || cat.includes("depression") || cat.includes("cuban missile") ||
      cat.includes("watergate") || cat.includes("chernobyl") || cat.includes("covid") ||
      cat.includes("d-day") || cat.includes("stalingrad") || cat.includes("napoleonic") ||
      cat.includes("vietnam") || cat.includes("samurai") || cat.includes("alexander") ||
      cat.includes("mongol") || cat.includes("crusades") || cat.includes("wwi") ||
      cat.includes("wwii") || cat.includes("special forces") || cat.includes("siege") ||
      cat.includes("military") || cat.includes("titanic") || cat.includes("presidential") ||
      cat.includes("royal family") || cat.includes("pirates") || cat.includes("royalty")) return "history";

  // Science
  if (cat.includes("science") || cat.includes("biology") || cat.includes("chemistry") ||
      cat.includes("physics") || cat.includes("math") || cat.includes("astronomy") ||
      cat.includes("space") || cat.includes("marine") || cat.includes("dinosaur") ||
      cat.includes("insect") || cat.includes("bird") || cat.includes("ecology") ||
      cat.includes("climate") || cat.includes("volcano") || cat.includes("genetic") ||
      cat.includes("neuroscience") || cat.includes("einstein") || cat.includes("newton") ||
      cat.includes("curie") || cat.includes("darwin") || cat.includes("tesla") ||
      cat.includes("hawking") || cat.includes("feynman") || cat.includes("sagan") ||
      cat.includes("turing") || cat.includes("lovelace") || cat.includes("galileo") ||
      cat.includes("da vinci") || cat.includes("franklin") || cat.includes("goodall") ||
      cat.includes("tyson") || cat.includes("black hole") || cat.includes("mars") ||
      cat.includes("solar system") || cat.includes("astronomer") || cat.includes("shuttle") ||
      cat.includes("iss") || cat.includes("exoplanet") || cat.includes("constellation") ||
      cat.includes("forensic") || cat.includes("robotics") || cat.includes("3d printing")) return "science";

  // Geography
  if (cat.includes("geography") || cat.includes("capital") || cat.includes("mountain") ||
      cat.includes("river") || cat.includes("lake") || cat.includes("desert") ||
      cat.includes("island") || cat.includes("flag") || cat.includes("everest") ||
      cat.includes("mariana") || cat.includes("amazon") || cat.includes("sahara") ||
      cat.includes("antarctica") || cat.includes("arctic") || cat.includes("grand canyon") ||
      cat.includes("barrier reef") || cat.includes("galápagos") || cat.includes("iceland") ||
      cat.includes("fjord") || cat.includes("new zealand") || cat.includes("biome")) return "geography";

  // Literature
  if (cat.includes("literature") || cat.includes("book") || cat.includes("novel") ||
      cat.includes("poetry") || cat.includes("fiction") || cat.includes("shakespeare") ||
      cat.includes("lord of the rings") || cat.includes("harry potter") || cat.includes("game of thrones") ||
      cat.includes("narnia") || cat.includes("dune") || cat.includes("sherlock") ||
      cat.includes("agatha christie") || cat.includes("stephen king") || cat.includes("lovecraft") ||
      cat.includes("austen") || cat.includes("dickens") || cat.includes("hemingway") ||
      cat.includes("fitzgerald") || cat.includes("orwell") || cat.includes("brave new world") ||
      cat.includes("mockingbird") || cat.includes("gatsby") || cat.includes("moby dick") ||
      cat.includes("pride and prejudice") || cat.includes("war and peace") || cat.includes("odyssey") ||
      cat.includes("divine comedy") || cat.includes("don quixote") || cat.includes("crime and punishment") ||
      cat.includes("catcher in the rye") || cat.includes("horror & gothic") || cat.includes("romance novel") ||
      cat.includes("children's lit")) return "literature";

  // Sports
  if (cat.includes("sport") || cat.includes("soccer") || cat.includes("football") ||
      cat.includes("basketball") || cat.includes("baseball") || cat.includes("tennis") ||
      cat.includes("golf") || cat.includes("olympic") || cat.includes("extreme") ||
      cat.includes("combat") || cat.includes("motorsport") || cat.includes("racing") ||
      cat.includes("wwe") || cat.includes("wrestling") || cat.includes("ufc") ||
      cat.includes("mma") || cat.includes("boxing") || cat.includes("chess") ||
      cat.includes("formula 1")) return "sports";

  // Food & Drink
  if (cat.includes("food") || cat.includes("drink") || cat.includes("cuisine") ||
      cat.includes("cooking") || cat.includes("culinary") || cat.includes("wine") ||
      cat.includes("coffee") || cat.includes("tea") || cat.includes("baking") ||
      cat.includes("cocktail") || cat.includes("beer") || cat.includes("candy") ||
      cat.includes("sushi") || cat.includes("italian") || cat.includes("french") ||
      cat.includes("thai") || cat.includes("indian") || cat.includes("mexican") ||
      cat.includes("chinese") || cat.includes("korean") || cat.includes("vietnamese") ||
      cat.includes("spanish") || cat.includes("greek") || cat.includes("turkish") ||
      cat.includes("lebanese") || cat.includes("ethiopian") || cat.includes("peruvian") ||
      cat.includes("whiskey") || cat.includes("bourbon") || cat.includes("champagne") ||
      cat.includes("tequila") || cat.includes("fast food")) return "food";

  // Arts
  if (cat.includes("art") || cat.includes("painting") || cat.includes("sculpture") ||
      cat.includes("van gogh") || cat.includes("picasso") || cat.includes("dalí") ||
      cat.includes("warhol") || cat.includes("banksy") || cat.includes("michelangelo") ||
      cat.includes("rembrandt") || cat.includes("monet") || cat.includes("impressionism") ||
      cat.includes("surrealism") || cat.includes("cubism") || cat.includes("baroque") ||
      cat.includes("pop art") || cat.includes("abstract") || cat.includes("graffiti") ||
      cat.includes("digital art") || cat.includes("nft") || cat.includes("photography") ||
      cat.includes("interior design") || cat.includes("ballet") || cat.includes("dance")) return "arts";

  // Technology
  if (cat.includes("tech") || cat.includes("crypto") || cat.includes("blockchain") ||
      cat.includes("ai") || cat.includes("artificial intelligence") || cat.includes("cyber") ||
      cat.includes("internet") || cat.includes("apple") || cat.includes("microsoft") ||
      cat.includes("google") || cat.includes("amazon") || cat.includes("tesla") ||
      cat.includes("spacex") || cat.includes("social media") || cat.includes("iphone") ||
      cat.includes("virtual reality") || cat.includes("augmented reality") || cat.includes("drone")) return "tech";

  // Culture
  if (cat.includes("culture") || cat.includes("religion") || cat.includes("indigenous") ||
      cat.includes("asian") || cat.includes("european") || cat.includes("latin american") ||
      cat.includes("middle eastern") || cat.includes("african") || cat.includes("civilization") ||
      cat.includes("anthropology") || cat.includes("sociology") || cat.includes("linguistic") ||
      cat.includes("language") || cat.includes("meme") || cat.includes("holiday") ||
      cat.includes("wedding") || cat.includes("etiquette") || cat.includes("tradition") ||
      cat.includes("superstition") || cat.includes("fashion") || cat.includes("streetwear") ||
      cat.includes("sneaker") || cat.includes("runway") || cat.includes("chanel")) return "culture";

  // Lifestyle
  if (cat.includes("fitness") || cat.includes("yoga") || cat.includes("meditation") ||
      cat.includes("board game") || cat.includes("card game") || cat.includes("poker") ||
      cat.includes("puzzle") || cat.includes("garden") || cat.includes("train") ||
      cat.includes("ship") || cat.includes("submarine") || cat.includes("helicopter") ||
      cat.includes("car") || cat.includes("motorcycle") || cat.includes("automobile") ||
      cat.includes("vehicle") || cat.includes("amusement") || cat.includes("theme park") ||
      cat.includes("magic") || cat.includes("illusion") || cat.includes("circus") ||
      cat.includes("las vegas") || cat.includes("heist") || cat.includes("treasure") ||
      cat.includes("spy") || cat.includes("espionage") || cat.includes("advertising") ||
      cat.includes("brand") || cat.includes("logo") || cat.includes("toy") ||
      cat.includes("collectible") || cat.includes("guinness") || cat.includes("record")) return "lifestyle";

  // Mythology
  if (cat.includes("mythology") || cat.includes("greek myth") || cat.includes("roman myth") ||
      cat.includes("norse") || cat.includes("egyptian myth") || cat.includes("dragon") ||
      cat.includes("vampire") || cat.includes("werewolf") || cat.includes("zombie") ||
      cat.includes("fairy") || cat.includes("fae") || cat.includes("mermaid") ||
      cat.includes("yokai") || cat.includes("celtic") || cat.includes("slavic") ||
      cat.includes("native american legend") || cat.includes("african folklore") ||
      cat.includes("aztec") || cat.includes("mayan") || cat.includes("folklore") ||
      cat.includes("urban legend") || cat.includes("ghost") || cat.includes("haunted") ||
      cat.includes("cult") || cat.includes("secret societ") || cat.includes("conspiracy") ||
      cat.includes("unsolved") || cat.includes("mystery") || cat.includes("true crime") ||
      cat.includes("serial killer") || cat.includes("cold case") || cat.includes("criminal") ||
      cat.includes("prison") || cat.includes("hoax") || cat.includes("prank") ||
      cat.includes("disaster") || cat.includes("trial") || cat.includes("oddities")) return "mythology";

  return "all";
};

// Get icon for a specific category based on its group
const getCategoryIcon = (category: string) => {
  const group = getCategoryGroup(category);
  return CATEGORY_GROUPS[group].icon;
};

export default function CategoriesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeGroup, setActiveGroup] = useState<keyof typeof CATEGORY_GROUPS>("all");

  const filteredCategories = useMemo(() => {
    let filtered = [...CATEGORIES];

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(cat =>
        cat.toLowerCase().includes(searchLower)
      );
    }

    // Filter by group
    if (activeGroup !== "all") {
      filtered = filtered.filter(cat => getCategoryGroup(cat) === activeGroup);
    }

    return filtered;
  }, [search, activeGroup]);

  const handleCategoryClick = (category: string) => {
    router.push(`/freeplay?category=${encodeURIComponent(category)}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.02,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 24,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.15 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-6 sm:py-12">
        <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
          {/* Header */}
          <div className="text-center space-y-3 sm:space-y-4">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-3"
            >
              <Sparkles className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">Categories</h1>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground max-w-lg mx-auto"
            >
              Explore {CATEGORIES.length} trivia categories. Click any to start playing!
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Badge variant="secondary" className="text-sm">
                {CATEGORIES.length} Categories for Daily Challenges
              </Badge>
            </motion.div>
          </div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative max-w-md mx-auto"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </motion.div>

          {/* Filter Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center"
          >
            <TooltipProvider delayDuration={100}>
              <Tabs value={activeGroup} onValueChange={(v) => setActiveGroup(v as keyof typeof CATEGORY_GROUPS)}>
                <TabsList className="h-auto p-1.5 gap-0.5 sm:gap-1 flex flex-wrap justify-center bg-muted/80">
                  {Object.entries(CATEGORY_GROUPS).map(([key, { label, icon: Icon }]) => (
                    <Tooltip key={key}>
                      <TooltipTrigger asChild>
                        <TabsTrigger
                          value={key}
                          className="h-9 w-9 sm:h-10 sm:w-10 p-0 flex items-center justify-center data-[state=active]:bg-background data-[state=active]:shadow-sm"
                        >
                          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                        </TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="hidden sm:block">
                        <p>{label}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </TabsList>
              </Tabs>
            </TooltipProvider>
          </motion.div>

          {/* Results count */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-sm text-muted-foreground"
          >
            Showing {filteredCategories.length} of {CATEGORIES.length} categories
          </motion.div>

          {/* Category Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeGroup}-${search}`}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
            >
              {filteredCategories.map((category) => {
                const Icon = getCategoryIcon(category);
                return (
                  <motion.div
                    key={category}
                    variants={itemVariants}
                    layout
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all group h-full"
                      onClick={() => handleCategoryClick(category)}
                    >
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                            {category}
                          </p>
                        </div>
                        <Play className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>

          {/* Empty State */}
          {filteredCategories.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="font-semibold text-lg mb-2">No categories found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Try adjusting your search or filter
              </p>
              <Button variant="outline" onClick={() => { setSearch(""); setActiveGroup("all"); }}>
                Clear Filters
              </Button>
            </motion.div>
          )}

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t"
          >
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary">{CATEGORIES.length}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Total Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary">{(CATEGORIES.length / 365).toFixed(1)}+</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Years of Unique Dailies</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary">{Object.keys(CATEGORY_GROUPS).length - 1}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Topic Groups</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary">Infinite</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Quiz Possibilities</div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
