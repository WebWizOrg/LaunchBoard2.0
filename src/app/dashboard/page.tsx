// src/app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  MoreHorizontal,
  PlusCircle,
  Trash2,
  Share2,
  Copy,
  Eye,
  BarChart,
  Users,
  Linkedin,
  Twitter,
  Facebook,
} from "lucide-react";
import { collection, query, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc, orderBy, getDoc, setDoc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { formatDistanceToNow } from 'date-fns';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function AnalyticsCard({ title, value, icon: Icon }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
            </CardContent>
        </Card>
    );
}

function SocialShareDialog({ resumeId, resumeName }) {
    const { toast } = useToast();
    const shareUrl = `${window.location.origin}/share/${resumeId}`;
    
    const socialLinks = {
        linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(`Check out my resume: ${resumeName}`)}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`Check out my resume: ${resumeName}`)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    };

    return (
         <DialogContent>
            <DialogHeader>
                <DialogTitle>Share "{resumeName}"</DialogTitle>
                <DialogDescription>
                    Share your published resume with your network or copy the link.
                </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
                <div className="flex gap-2">
                    <Input id="share-link" defaultValue={shareUrl} readOnly />
                    <Button onClick={() => {
                        navigator.clipboard.writeText(shareUrl);
                        toast({ title: "Copied to clipboard!" });
                    }}>
                        <Copy className="h-4 w-4"/>
                    </Button>
                </div>
                <div className="flex justify-center gap-4">
                     <Button variant="outline" asChild>
                        <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                            <Linkedin className="mr-2 h-4 w-4" /> LinkedIn
                        </a>
                    </Button>
                    <Button variant="outline" asChild>
                         <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                            <Twitter className="mr-2 h-4 w-4" /> Twitter
                        </a>
                    </Button>
                    <Button variant="outline" asChild>
                         <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer">
                            <Facebook className="mr-2 h-4 w-4" /> Facebook
                        </a>
                    </Button>
                </div>
            </div>
        </DialogContent>
    )
}

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [resumes, setResumes] = useState([]);
  const [analytics, setAnalytics] = useState({ totalViews: 0, uniqueVisitors: 0, totalShares: 0 });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    };
    
    const q = query(collection(db, `users/${user.uid}/resumes`), orderBy('updatedAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const resumesData = [];
      querySnapshot.forEach((doc) => {
        resumesData.push({ id: doc.id, ...doc.data() });
      });
      setResumes(resumesData);
      
      // Calculate analytics based on published resumes
      const publishedResumes = resumesData.filter(r => r.isPublished);
      if (publishedResumes.length > 0) {
          // In a real app, this would fetch from an analytics backend.
          // For now, we'll simulate some data.
          const totalViews = publishedResumes.reduce((acc, r) => acc + (r.views || 0), 0);
          const uniqueVisitors = publishedResumes.reduce((acc, r) => acc + (r.uniqueVisitors || 0), 0);
          const totalShares = publishedResumes.reduce((acc, r) => acc + (r.shares || 0), 0);
          setAnalytics({ totalViews, uniqueVisitors, totalShares });
      } else {
          setAnalytics({ totalViews: 0, uniqueVisitors: 0, totalShares: 0 });
      }
      
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [user]);

  const createNewResume = async () => {
    if (!user) return;
    try {
      const newResumeRef = await addDoc(collection(db, `users/${user.uid}/resumes`), {
        name: 'Untitled Resume',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isPublished: false,
      });
      router.push(`/builder?id=${newResumeRef.id}`);
    } catch (error) {
      console.error("Error creating new resume: ", error);
      toast({ title: 'Error creating resume', variant: 'destructive' });
    }
  };
  
  const deleteResume = async (resumeId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/resumes`, resumeId));
      // also delete from published resumes
      await deleteDoc(doc(db, 'publishedResumes', resumeId));
      toast({ title: 'Resume deleted successfully' });
    } catch (error) {
      console.error("Error deleting resume: ", error);
       toast({ title: 'Error deleting resume', variant: 'destructive' });
    }
  }

  const duplicateResume = async (resumeId: string) => {
    if(!user) return;
    try {
        const originalResumeRef = doc(db, `users/${user.uid}/resumes`, resumeId);
        const originalResumeSnap = await getDoc(originalResumeRef);

        if(originalResumeSnap.exists()) {
            const originalData = originalResumeSnap.data();
            const newResumeData = {
                ...originalData,
                name: `Copy of ${originalData.name}`,
                isPublished: false, // Duplicates are not published by default
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };
            const newResumeRef = await addDoc(collection(db, `users/${user.uid}/resumes`), newResumeData);
            toast({ title: 'Resume duplicated!', description: `Created "${newResumeData.name}"` });
            router.push(`/builder?id=${newResumeRef.id}`);
        }
    } catch (error) {
        console.error("Error duplicating resume:", error);
        toast({ title: 'Error duplicating resume', variant: 'destructive' });
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <AnalyticsCard title="Total Views" value={analytics.totalViews} icon={BarChart} />
            <AnalyticsCard title="Unique Visitors" value={analytics.uniqueVisitors} icon={Users} />
            <AnalyticsCard title="Total Shares" value={analytics.totalShares} icon={Share2} />
        </div>
        <div>
          <Card>
             <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>Resumes & Portfolios</CardTitle>
                <CardDescription>
                  Manage your documents and track their performance.
                </CardDescription>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Button size="sm" className="h-8 gap-1" onClick={createNewResume}>
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Create New
                  </span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                     <TableHead className="hidden md:table-cell">
                      Status
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Last Modified
                    </TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">Loading...</TableCell>
                    </TableRow>
                  ) : resumes.length > 0 ? (
                    resumes.map(resume => (
                      <TableRow key={resume.id}>
                      <TableCell className="font-medium">{resume.name}</TableCell>
                       <TableCell className="hidden md:table-cell">
                        <Badge variant={resume.isPublished ? "default" : "secondary"}>
                          {resume.isPublished ? 'Published' : 'Draft'}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {resume.updatedAt ? formatDistanceToNow(resume.updatedAt.toDate(), { addSuffix: true }) : 'N/A'}
                      </TableCell>
                      <TableCell>
                         <Dialog>
                            <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                aria-haspopup="true"
                                size="icon"
                                variant="ghost"
                                >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => router.push(`/builder?id=${resume.id}`)}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.push(`/share/${resume.id}`)} disabled={!resume.isPublished}>
                                <Eye className="mr-2 h-4 w-4" />
                                Preview
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => duplicateResume(resume.id)}>
                                    <Copy className="mr-2 h-4 w-4" />
                                    Duplicate
                                </DropdownMenuItem>
                                <DialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} disabled={!resume.isPublished}>
                                        <Share2 className="mr-2 h-4 w-4" />
                                        Share
                                    </DropdownMenuItem>
                                </DialogTrigger>

                                <DropdownMenuSeparator />
                                <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete your
                                        resume and remove your data from our servers.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => deleteResume(resume.id)} className="bg-destructive hover:bg-destructive/90">
                                        Continue
                                    </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                                </AlertDialog>
                            </DropdownMenuContent>
                            </DropdownMenu>
                            <SocialShareDialog resumeId={resume.id} resumeName={resume.name} />
                        </Dialog>
                      </TableCell>
                    </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">No resumes found. Create one to get started!</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
