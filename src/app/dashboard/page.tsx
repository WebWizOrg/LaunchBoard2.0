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
  LayoutTemplate
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

function SocialShareDialog({ docId, docName, docType }) {
    const { toast } = useToast();
    const shareUrl = `${window.location.origin}/${docType === 'resume' ? 'share' : 'portfolio/share'}/${docId}`;
    
    const socialLinks = {
        linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(`Check out my ${docType}: ${docName}`)}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`Check out my ${docType}: ${docName}`)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    };

    return (
         <DialogContent>
            <DialogHeader>
                <DialogTitle>Share "{docName}"</DialogTitle>
                <DialogDescription>
                    Share your published {docType} with your network or copy the link.
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
  const [documents, setDocuments] = useState([]);
  const [analytics, setAnalytics] = useState({ totalViews: 0, uniqueVisitors: 0, totalShares: 0 });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    };
    
    const sortDocs = (a, b) => {
        const timeA = a.updatedAt?.toMillis() || 0;
        const timeB = b.updatedAt?.toMillis() || 0;
        return timeB - timeA;
    };

    const resumesQuery = query(collection(db, `users/${user.uid}/resumes`), orderBy('updatedAt', 'desc'));
    const portfoliosQuery = query(collection(db, `users/${user.uid}/portfolios`), orderBy('updatedAt', 'desc'));

    const unsubscribeResumes = onSnapshot(resumesQuery, (querySnapshot) => {
        const resumesData = querySnapshot.docs.map(doc => ({ id: doc.id, type: 'resume', ...doc.data() }));
        setDocuments(prev => {
            const otherDocs = prev.filter(d => d.type !== 'resume');
            const allDocs = [...resumesData, ...otherDocs].sort(sortDocs);
            updateAnalytics(allDocs);
            return allDocs;
        });
        setLoading(false);
    });

    const unsubscribePortfolios = onSnapshot(portfoliosQuery, (querySnapshot) => {
        const portfoliosData = querySnapshot.docs.map(doc => ({ id: doc.id, type: 'portfolio', ...doc.data() }));
        setDocuments(prev => {
            const otherDocs = prev.filter(d => d.type !== 'portfolio');
            const allDocs = [...portfoliosData, ...otherDocs].sort(sortDocs);
            updateAnalytics(allDocs);
            return allDocs;
        });
        setLoading(false);
    });
    
    const updateAnalytics = (docs) => {
        const publishedDocs = docs.filter(r => r.isPublished);
        if (publishedDocs.length > 0) {
            const totalViews = publishedDocs.reduce((acc, r) => acc + (r.views || 0), 0);
            const uniqueVisitors = publishedDocs.reduce((acc, r) => acc + (r.uniqueVisitors || 0), 0);
            const totalShares = publishedDocs.reduce((acc, r) => acc + (r.shares || 0), 0);
            setAnalytics({ totalViews, uniqueVisitors, totalShares });
        } else {
            setAnalytics({ totalViews: 0, uniqueVisitors: 0, totalShares: 0 });
        }
    }

    return () => {
      unsubscribeResumes();
      unsubscribePortfolios();
    };
  }, [user]);

  const createNewDoc = async (type: 'resume' | 'portfolio') => {
    if (!user) return;
    try {
      const collectionName = type === 'resume' ? 'resumes' : 'portfolios';
      const newDocData = {
        name: `Untitled ${type.charAt(0).toUpperCase() + type.slice(1)}`,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isPublished: true, // Published by default
      };
      const newDocRef = await addDoc(collection(db, `users/${user.uid}/${collectionName}`), newDocData);

      // Also create the public document
      const publicCollectionName = type === 'resume' ? 'publishedResumes' : 'publishedPortfolios';
      const publicDocRef = doc(db, publicCollectionName, newDocRef.id);
      await setDoc(publicDocRef, {...newDocData, ownerId: user.uid});

      const path = type === 'resume' ? '/builder' : '/portfolio/builder';
      router.push(`${path}?id=${newDocRef.id}`);
    } catch (error) {
      console.error(`Error creating new ${type}: `, error);
      toast({ title: `Error creating ${type}`, variant: 'destructive' });
    }
  };
  
  const deleteDocAndPublish = async (docId: string, type: 'resume' | 'portfolio') => {
    if (!user) return;
    try {
      const collectionName = type === 'resume' ? 'resumes' : 'portfolios';
      const publishedCollectionName = type === 'resume' ? 'publishedResumes' : 'publishedPortfolios';
      await deleteDoc(doc(db, `users/${user.uid}/${collectionName}`, docId));
      // Attempt to delete from published collection, will not throw error if it doesn't exist.
      await deleteDoc(doc(db, publishedCollectionName, docId)).catch(() => {});
      toast({ title: `${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully` });
    } catch (error) {
      console.error(`Error deleting ${type}: `, error);
       toast({ title: `Error deleting ${type}`, variant: 'destructive' });
    }
  }

  const duplicateDoc = async (docId: string, type: 'resume' | 'portfolio') => {
    if(!user) return;
    try {
        const collectionName = type === 'resume' ? 'resumes' : 'portfolios';
        const originalDocRef = doc(db, `users/${user.uid}/${collectionName}`, docId);
        const originalDocSnap = await getDoc(originalDocRef);

        if(originalDocSnap.exists()) {
            const originalData = originalDocSnap.data();
            const newDocData = {
                ...originalData,
                name: `Copy of ${originalData.name}`,
                isPublished: false,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };
            const newDocRef = await addDoc(collection(db, `users/${user.uid}/${collectionName}`), newDocData);
            toast({ title: 'Document duplicated!', description: `Created "${newDocData.name}"` });
            const path = type === 'resume' ? '/builder' : '/portfolio/builder';
            router.push(`${path}?id=${newDocRef.id}`);
        }
    } catch (error) {
        console.error("Error duplicating document:", error);
        toast({ title: 'Error duplicating document', variant: 'destructive' });
    }
  }
  
  const getEditPath = (doc) => {
      const path = doc.type === 'resume' ? '/builder' : '/portfolio/builder';
      return `${path}?id=${doc.id}`;
  }

  const getSharePath = (doc) => {
      const path = doc.type === 'resume' ? '/share' : '/portfolio/share';
      return `${path}/${doc.id}`;
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
                 <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" className="h-8 gap-1">
                      <PlusCircle className="h-3.5 w-3.5" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Create New
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => createNewDoc('resume')}>
                        <FileText className="mr-2 h-4 w-4" />
                        New Resume
                    </DropdownMenuItem>
                     <DropdownMenuItem onClick={() => createNewDoc('portfolio')}>
                        <LayoutTemplate className="mr-2 h-4 w-4" />
                        New Portfolio
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">Type</TableHead>
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
                      <TableCell colSpan={5} className="text-center">Loading...</TableCell>
                    </TableRow>
                  ) : documents.length > 0 ? (
                    documents.map(doc => (
                      <TableRow key={doc.id}>
                      <TableCell className="font-medium">{doc.name}</TableCell>
                      <TableCell className="hidden md:table-cell capitalize">{doc.type}</TableCell>
                       <TableCell className="hidden md:table-cell">
                        <Badge variant={doc.isPublished ? "default" : "secondary"}>
                          {doc.isPublished ? 'Published' : 'Draft'}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {doc.updatedAt ? formatDistanceToNow(doc.updatedAt.toDate(), { addSuffix: true }) : 'N/A'}
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
                                <DropdownMenuItem onClick={() => router.push(getEditPath(doc))}>
                                    {doc.type === 'resume' ? <FileText className="mr-2 h-4 w-4" /> : <LayoutTemplate className="mr-2 h-4 w-4" />}
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.push(getSharePath(doc))} disabled={!doc.isPublished}>
                                <Eye className="mr-2 h-4 w-4" />
                                Preview
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => duplicateDoc(doc.id, doc.type)}>
                                    <Copy className="mr-2 h-4 w-4" />
                                    Duplicate
                                </DropdownMenuItem>
                                <DialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} disabled={!doc.isPublished}>
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
                                        document and remove your data from our servers.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => deleteDocAndPublish(doc.id, doc.type)} className="bg-destructive hover:bg-destructive/90">
                                        Continue
                                    </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                                </AlertDialog>
                            </DropdownMenuContent>
                            </DropdownMenu>
                            <SocialShareDialog docId={doc.id} docName={doc.name} docType={doc.type} />
                        </Dialog>
                      </TableCell>
                    </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">No documents found. Create one to get started!</TableCell>
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
