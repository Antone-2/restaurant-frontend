import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Share2,
    Facebook,
    Twitter,
    MessageCircle,
    Check,
    Copy
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface SocialShareProps {
    title: string;
    description?: string;
    url?: string;
    image?: string;
    buttonVariant?: "default" | "outline" | "ghost";
    buttonSize?: "default" | "sm" | "lg" | "icon";
    showLabel?: boolean;
}

const SocialShare = ({
    title,
    description,
    url,
    image,
    buttonVariant = "outline",
    buttonSize = "icon",
    showLabel = false
}: SocialShareProps) => {
    const { toast } = useToast();
    const [copied, setCopied] = useState(false);
    const [open, setOpen] = useState(false);

    // Get current URL if not provided
    const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(title);

    const shareLinks = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
        whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            toast({
                title: "Link copied!",
                description: "The link has been copied to your clipboard"
            });
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast({
                title: "Failed to copy",
                description: "Please try copying the link manually",
                variant: "destructive"
            });
        }
    };

    const openShareWindow = (shareUrl: string) => {
        window.open(shareUrl, '_blank', 'width=600,height=400,scrollbars=yes');
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant={buttonVariant} size={buttonSize} className={showLabel ? "gap-2" : ""}>
                    <Share2 className="w-4 h-4" />
                    {showLabel && "Share"}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Share "{title}"</DialogTitle>
                    <DialogDescription>
                        Share this with your friends and family
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Share Buttons */}
                    <div className="grid grid-cols-3 gap-4">
                        {/* Facebook */}
                        <Button
                            variant="outline"
                            className="flex flex-col items-center gap-2 h-auto py-4 hover:bg-blue-50 hover:text-blue-600"
                            onClick={() => openShareWindow(shareLinks.facebook)}
                        >
                            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center">
                                <Facebook className="w-5 h-5" />
                            </div>
                            <span className="text-xs">Facebook</span>
                        </Button>

                        {/* Twitter/X */}
                        <Button
                            variant="outline"
                            className="flex flex-col items-center gap-2 h-auto py-4 hover:bg-black hover:text-white"
                            onClick={() => openShareWindow(shareLinks.twitter)}
                        >
                            <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center">
                                <Twitter className="w-5 h-5" />
                            </div>
                            <span className="text-xs">Twitter</span>
                        </Button>

                        {/* WhatsApp */}
                        <Button
                            variant="outline"
                            className="flex flex-col items-center gap-2 h-auto py-4 hover:bg-green-50 hover:text-green-600"
                            onClick={() => openShareWindow(shareLinks.whatsapp)}
                        >
                            <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center">
                                <MessageCircle className="w-5 h-5" />
                            </div>
                            <span className="text-xs">WhatsApp</span>
                        </Button>
                    </div>

                    {/* Copy Link */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Or copy link</label>
                        <div className="flex gap-2">
                            <Input
                                value={shareUrl}
                                readOnly
                                className="flex-1"
                            />
                            <Button
                                variant="secondary"
                                size="icon"
                                onClick={handleCopyLink}
                            >
                                {copied ? (
                                    <Check className="w-4 h-4 text-green-500" />
                                ) : (
                                    <Copy className="w-4 h-4" />
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Preview */}
                    {image && (
                        <div className="border rounded-lg overflow-hidden">
                            {image && (
                                <img
                                    src={image}
                                    alt={title}
                                    className="w-full h-32 object-cover"
                                />
                            )}
                            <div className="p-3">
                                <p className="font-medium text-sm">{title}</p>
                                {description && (
                                    <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default SocialShare;
