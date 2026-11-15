#import <AppKit/AppKit.h>
#import <PDFKit/PDFKit.h>

int main(int argc, const char *argv[]) {
  @autoreleasepool {
    if (argc != 4) {
      fprintf(stderr, "usage: render-pdf INPUT OUTPUT SCALE\n");
      return 1;
    }
    NSURL *input = [NSURL fileURLWithPath:[NSString stringWithUTF8String:argv[1]]];
    NSURL *output = [NSURL fileURLWithPath:[NSString stringWithUTF8String:argv[2]]];
    CGFloat scale = MAX(1.0, atof(argv[3]));
    PDFDocument *document = [[PDFDocument alloc] initWithURL:input];
    PDFPage *page = [document pageAtIndex:0];
    if (!page) return 1;

    NSRect bounds = [page boundsForBox:kPDFDisplayBoxMediaBox];
    NSInteger width = (NSInteger)ceil(bounds.size.width * scale);
    NSInteger height = (NSInteger)ceil(bounds.size.height * scale);
    NSBitmapImageRep *bitmap = [[NSBitmapImageRep alloc]
      initWithBitmapDataPlanes:NULL pixelsWide:width pixelsHigh:height
      bitsPerSample:8 samplesPerPixel:4 hasAlpha:YES isPlanar:NO
      colorSpaceName:NSDeviceRGBColorSpace bytesPerRow:0 bitsPerPixel:0];
    NSGraphicsContext *graphics = [NSGraphicsContext graphicsContextWithBitmapImageRep:bitmap];
    [NSGraphicsContext saveGraphicsState];
    [NSGraphicsContext setCurrentContext:graphics];
    CGContextRef context = graphics.CGContext;
    CGContextClearRect(context, CGRectMake(0, 0, width, height));
    CGContextScaleCTM(context, scale, scale);
    [page drawWithBox:kPDFDisplayBoxMediaBox toContext:context];
    [graphics flushGraphics];
    [NSGraphicsContext restoreGraphicsState];

    NSData *data = [bitmap representationUsingType:NSBitmapImageFileTypePNG properties:@{}];
    return [data writeToURL:output atomically:YES] ? 0 : 1;
  }
}
